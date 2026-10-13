"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AuthorizationDetails = {
  authorization_id?: string;

  client?: {
    id?: string;
    name?: string;
  };

  scope?: string;
  scopes?: string[];
};

export default function OAuthConsentClient() {
  const searchParams = useSearchParams();

  const authorizationId =
    searchParams.get("authorization_id");

  const [details, setDetails] =
    useState<AuthorizationDetails | null>(null);

  const [needsLogin, setNeedsLogin] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  /**
   * OAuth認可リクエストを読み込む
   */
  useEffect(() => {
    async function initialize() {
      if (!authorizationId) {
        setError("authorization_id がありません");
        setLoading(false);
        return;
      }

      const supabase = createClient();

      /*
       * 1. Supabaseにログイン済みか確認
       */
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setNeedsLogin(true);
        setLoading(false);
        return;
      }

      /*
       * 2. OAuth Authorization Requestを取得
       */
      const { data, error } =
        await supabase.auth.oauth.getAuthorizationDetails(
          authorizationId,
        );

      if (error) {
        console.error(
          "getAuthorizationDetails:",
          error,
        );

        setError(error.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setError(
          "OAuth認可情報を取得できませんでした。",
        );
        setLoading(false);
        return;
      }

      /*
       * 3. redirect_url が返された場合
       *
       * すでに認可処理が完了しているため、
       * Supabaseが生成したURLへそのまま戻す。
       *
       * 今回確認できたChatGPTへの戻りURLが
       * ここに入る。
       */
      if (
        "redirect_url" in data &&
        typeof data.redirect_url === "string"
      ) {
        window.location.replace(data.redirect_url);
        return;
      }

      /*
       * 4. ユーザーの同意が必要
       */
      setDetails(data as AuthorizationDetails);
      setLoading(false);
    }

    initialize();
  }, [authorizationId]);

  /**
   * Googleログイン
   */
  async function loginWithGoogle() {
  if (!authorizationId) {
    setError("authorization_id がありません");
    return;
  }

  setLoading(true);
  setError(null);

  const supabase = createClient();

  // 現在のSupabaseセッションを終了
  await supabase.auth.signOut();

  const callbackUrl =
    `${window.location.origin}/auth/callback` +
    `?authorization_id=${encodeURIComponent(authorizationId)}`;

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl,

      // Googleに必ずアカウント選択画面を要求
      queryParams: {
        prompt: "select_account",
      },
    },
  });

  if (error) {
    console.error("signInWithOAuth:", error);
    setError(error.message);
    setLoading(false);
  }
}

  /**
   * OAuth認可
   */
  async function approve() {
    if (!authorizationId) {
      setError("authorization_id がありません");
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();

    const { data, error } =
      await supabase.auth.oauth.approveAuthorization(
        authorizationId,
      );

    if (error) {
      console.error(
        "approveAuthorization:",
        error,
      );

      setError(error.message);
      setLoading(false);
      return;
    }

    if (!data?.redirect_url) {
      setError(
        "認可後のリダイレクトURLが取得できませんでした。",
      );
      setLoading(false);
      return;
    }

    /*
     * ChatGPTへ戻す
     */
    window.location.replace(data.redirect_url);
  }

  /**
   * OAuth認可を拒否
   */
  async function deny() {
    if (!authorizationId) {
      setError("authorization_id がありません");
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();

    const { data, error } =
      await supabase.auth.oauth.denyAuthorization(
        authorizationId,
      );

    if (error) {
      console.error(
        "denyAuthorization:",
        error,
      );

      setError(error.message);
      setLoading(false);
      return;
    }

    if (!data?.redirect_url) {
      setError(
        "拒否後のリダイレクトURLが取得できませんでした。",
      );
      setLoading(false);
      return;
    }

    /*
     * ChatGPTへ戻す
     */
    window.location.replace(data.redirect_url);
  }

  /*
   * Loading
   */
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>読み込み中...</p>
      </main>
    );
  }

  /*
   * Error
   */
  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <div className="w-full max-w-lg rounded-xl border p-8">
          <h1 className="mb-4 text-xl font-bold">
            OAuth Error
          </h1>

          <p className="whitespace-pre-wrap text-red-600">
            {error}
          </p>
        </div>
      </main>
    );
  }

  /*
   * Googleログインが必要
   */
  if (needsLogin) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <div className="w-full max-w-lg rounded-xl border p-8">
          <h1 className="mb-4 text-2xl font-bold">
            ログイン
          </h1>

          <p className="mb-6">
            続行するにはGoogleアカウントで
            ログインしてください。
          </p>

          <button
            type="button"
            onClick={loginWithGoogle}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
          >
            Googleでログイン
          </button>
        </div>
      </main>
    );
  }

  /*
   * Authorization Detailsが存在しない
   */
  if (!details) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>
          OAuth認可情報を取得できませんでした。
        </p>
      </main>
    );
  }

  /*
   * Consent画面
   */
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-lg rounded-xl border p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold">
          アクセス許可
        </h1>

        <p className="mb-6">
          <strong>
            {details.client?.name ?? "ChatGPT"}
          </strong>
          があなたのアカウントへのアクセスを
          要求しています。
        </p>

        {details.scope && (
          <div className="mb-6">
            <p className="mb-2 font-medium">
              要求された権限
            </p>

            <code className="block rounded bg-gray-100 p-3 text-sm text-black">
              {details.scope}
            </code>
          </div>
        )}

        {details.scopes &&
          details.scopes.length > 0 && (
            <div className="mb-6">
              <p className="mb-2 font-medium">
                要求された権限
              </p>

              <ul className="list-inside list-disc">
                {details.scopes.map((scope) => (
                  <li key={scope}>
                    {scope}
                  </li>
                ))}
              </ul>
            </div>
          )}

        <div className="flex gap-4">
          <button
            type="button"
            onClick={approve}
            className="flex-1 rounded-lg bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700"
          >
            許可する
          </button>

          <button
            type="button"
            onClick={deny}
            className="flex-1 rounded-lg bg-gray-500 px-6 py-3 font-medium text-white hover:bg-gray-600"
          >
            拒否する
          </button>
        </div>
      </div>
    </main>
  );
}