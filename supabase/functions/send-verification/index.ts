
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    console.log('Processing verification for email:', email);
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Generate a 6-digit PIN
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Create expiration timestamp (15 minutes from now)
    const expires_at = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    console.log("Storing PIN for email:", email);

    // Store the PIN in the database using Supabase REST API
    const supabaseResponse = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/verificationpins`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        },
        body: JSON.stringify({ email, pin, expires_at }),
      }
    );

    if (!supabaseResponse.ok) {
      const error = await supabaseResponse.text();
      console.error('Database error:', error);
      throw new Error(`Database error: ${error}`);
    }

    console.log("Sending email to:", email);

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    const emailResponse = await resend.emails.send({
      from: `Hug A Warrior <noreply@hugawarrior.lovable.app>`,
      to: [email],
      subject: 'Your Verification PIN',
      html: `
        <h2>Your Verification PIN</h2>
        <p>Your verification PIN is: <strong>${pin}</strong></p>
        <p>This PIN will expire in 15 minutes.</p>
      `,
    });

    if (emailResponse.error) {
      throw new Error(`Failed to send email: ${emailResponse.error.message}`);
    }

    console.log('Email sent successfully:', emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: 'PIN sent successfully' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in send-verification function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
