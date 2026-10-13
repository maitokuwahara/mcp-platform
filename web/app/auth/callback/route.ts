import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);

  const code = url.searchParams.get("code");
  const authorizationId =
    url.searchParams.get("authorization_id");

  if (!code) {
    return NextResponse.json(
      { error: "OAuth code is missing" },
      { status: 400 },
    );
  }

  if (!authorizationId) {
    return NextResponse.json(
      { error: "authorization_id is missing" },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  const { error } =
    await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("exchangeCodeForSession:", error);

    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 400 },
    );
  }

  const consentUrl = new URL(
    "/oauth/consent",
    request.url,
  );

  consentUrl.searchParams.set(
    "authorization_id",
    authorizationId,
  );

  return NextResponse.redirect(consentUrl);
}
