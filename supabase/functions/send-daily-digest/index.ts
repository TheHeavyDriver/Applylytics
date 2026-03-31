import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

interface FollowUp {
  id: string;
  scheduled_date: string;
  completed: boolean;
  applications: {
    company: string;
    role: string;
  } | null;
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

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date().toISOString().split("T")[0];

    const { data: pendingFollowUps, error: followUpsError } = await supabase
      .from("follow_ups")
      .select(`
        id,
        scheduled_date,
        completed,
        applications:applications(company, role)
      `)
      .eq("completed", false)
      .lte("scheduled_date", today)
      .order("scheduled_date", { ascending: true });

    if (followUpsError) throw followUpsError;

    if (!pendingFollowUps || pendingFollowUps.length === 0) {
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

    const { data: usersWithDigest } = await supabase
      .from("email_preferences")
      .select("user_id, profiles(email)")
      .eq("daily_digest_enabled", true);

    const followUpsByUser: Record<string, FollowUp[]> = {};
    
    for (const followUp of pendingFollowUps as FollowUp[]) {
      const userId = followUp.applications?.company;
      if (!userId) continue;
    }

    const { data: allFollowUps, error: allError } = await supabase
      .from("follow_ups")
      .select(`
        user_id,
        scheduled_date,
        applications:applications(company, role)
      `)
      .eq("completed", false)
      .lte("scheduled_date", today);

    if (allError) throw allError;

    for (const fu of allFollowUps || []) {
      const userId = (fu as any).user_id;
      if (!followUpsByUser[userId]) {
        followUpsByUser[userId] = [];
      }
      followUpsByUser[userId].push(fu as FollowUp);
    }

    let emailsSent = 0;

    for (const userId of Object.keys(followUpsByUser)) {
      const { data: userData } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", userId)
        .single();

      if (!userData?.email) continue;

      const userFollowUps = followUpsByUser[userId];
      const overdue = userFollowUps.filter(f => f.scheduled_date < today);
      const dueToday = userFollowUps.filter(f => f.scheduled_date === today);

      const subject = overdue.length > 0
        ? `⚠️ ${overdue.length} overdue follow-up${overdue.length > 1 ? "s" : ""}`
        : `📋 ${userFollowUps.length} follow-up${userFollowUps.length > 1 ? "s" : ""} to catch up`;

      const overdueList = overdue.length > 0
        ? `<h3 style="color: #dc2626; margin: 16px 0 8px;">Overdue</h3>
           <ul>${overdue.map(f => `<li><strong>${f.applications?.company || "Unknown"}</strong> - ${f.applications?.role || "N/A"}</li>`).join("")}</ul>`
        : "";

      const todayList = dueToday.length > 0
        ? `<h3 style="color: #f59e0b; margin: 16px 0 8px;">Due Today</h3>
           <ul>${dueToday.map(f => `<li><strong>${f.applications?.company || "Unknown"}</strong> - ${f.applications?.role || "N/A"}</li>`).join("")}</ul>`
        : "";

      const html = `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4f46e5;">Applylytics Daily Digest</h1>
          <p style="color: #6b7280;">Here's your job application follow-up summary for today.</p>
          ${overdueList}
          ${todayList}
          <p style="margin-top: 24px; color: #6b7280; font-size: 14px;">
            <a href="${Deno.env.get("APP_URL") || "http://localhost:3000"}/follow-ups" style="color: #4f46e5;">View all follow-ups →</a>
          </p>
        </div>
      `;

      if (RESEND_API_KEY) {
        await fetch("https://api.resend.com/emails", {
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
