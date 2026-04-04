import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

interface FollowUp {
  id: string;
  user_id: string;
  scheduled_date: string;
  completed: boolean;
  applications: {
    company: string;
    role: string;
  } | null;
}

interface UserFollowUps {
  userId: string;
  email: string;
  overdue: FollowUp[];
  dueToday: FollowUp[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const appUrl = Deno.env.get("APP_URL") || "http://localhost:3000";

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const { data: followUps, error: followUpsError } = await supabase
      .from("follow_ups")
      .select(`
        id,
        user_id,
        scheduled_date,
        completed,
        applications:applications(company, role)
      `)
      .eq("completed", false)
      .lte("scheduled_date", today);

    if (followUpsError) throw followUpsError;

    if (!followUps || followUps.length === 0) {
      return new Response(
        JSON.stringify({ message: "No follow-ups due today" }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const userMap: Record<string, UserFollowUps> = {};

    for (const fu of followUps as FollowUp[]) {
      const userId = fu.user_id;
      if (!userId) continue;

      if (!userMap[userId]) {
        userMap[userId] = {
          userId,
          email: "",
          overdue: [],
          dueToday: [],
        };
      }

      if (fu.scheduled_date < today) {
        userMap[userId].overdue.push(fu);
      } else {
        userMap[userId].dueToday.push(fu);
      }
    }

    const userIds = Object.keys(userMap);
    if (userIds.length === 0) {
      return new Response(
        JSON.stringify({ message: "No users with follow-ups" }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const { data: preferences, error: prefsError } = await supabase
      .from("email_preferences")
      .select("user_id, daily_digest_enabled, digest_time, last_sent_at")
      .in("user_id", userIds)
      .eq("daily_digest_enabled", true);

    if (prefsError) throw prefsError;

    const prefsByUser: Record<string, { digest_time: string; last_sent_at: string | null }> = {};
    for (const p of preferences || []) {
      prefsByUser[p.user_id] = { 
        digest_time: p.digest_time, 
        last_sent_at: p.last_sent_at 
      };
    }

    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, email")
      .in("id", userIds);

    if (profileError) throw profileError;

    for (const profile of profiles || []) {
      if (userMap[profile.id]) {
        userMap[profile.id].email = profile.email;
      }
    }

    const timeNow = `${String(currentHour).padStart(2, "0")}:${String(currentMinute).padStart(2, "0")}`;
    const todayStr = today;

    let emailsSent = 0;

    for (const userId of userIds) {
      const userData = userMap[userId];
      if (!userData.email) continue;

      const prefs = prefsByUser[userId];
      if (!prefs) continue;

      const [targetHour, targetMinute] = prefs.digest_time.split(":").map(Number);
      if (currentHour !== targetHour || currentMinute !== targetMinute) continue;

      if (prefs.last_sent_at) {
        const lastSent = prefs.last_sent_at.split("T")[0];
        if (lastSent === todayStr) continue;
      }

      const totalCount = userData.overdue.length + userData.dueToday.length;
      const subject = userData.overdue.length > 0
        ? `⚠️ ${userData.overdue.length} overdue follow-up${userData.overdue.length > 1 ? "s" : ""}`
        : `📋 ${totalCount} follow-up${totalCount > 1 ? "s" : ""} to catch up`;

      const overdueList = userData.overdue.length > 0
        ? `<h3 style="color: #dc2626; margin: 16px 0 8px;">Overdue</h3>
           <ul>${userData.overdue.map(f => `<li><strong>${f.applications?.company || "Unknown"}</strong> - ${f.applications?.role || "N/A"}</li>`).join("")}</ul>`
        : "";

      const todayList = userData.dueToday.length > 0
        ? `<h3 style="color: #f59e0b; margin: 16px 0 8px;">Due Today</h3>
           <ul>${userData.dueToday.map(f => `<li><strong>${f.applications?.company || "Unknown"}</strong> - ${f.applications?.role || "N/A"}</li>`).join("")}</ul>`
        : "";

      const html = `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4f46e5;">Applylytics Daily Digest</h1>
          <p style="color: #6b7280;">Here's your job application follow-up summary for today.</p>
          ${overdueList}
          ${todayList}
          <p style="margin-top: 24px; color: #6b7280; font-size: 14px;">
            <a href="${appUrl}/follow-ups" style="color: #4f46e5;">View all follow-ups →</a>
          </p>
          <p style="margin-top: 16px; font-size: 12px; color: #9ca3af;">
            <a href="${appUrl}/settings" style="color: #9ca3af;">Manage email preferences</a>
          </p>
        </div>
      `;

      if (RESEND_API_KEY) {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Applylytics <digest@yourdomain.com>",
            to: userData.email,
            subject,
            html,
          }),
        });

        if (response.ok) {
          await supabase
            .from("email_preferences")
            .update({ last_sent_at: now.toISOString() })
            .eq("user_id", userId);
        }
      }

      emailsSent++;
    }

    return new Response(
      JSON.stringify({ message: `Digest sent to ${emailsSent} user(s)` }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
