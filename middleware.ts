import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token");
  const isLoginPage = request.nextUrl.pathname === "/login";
  const isRegisterPage = request.nextUrl.pathname === "/register";

  // 認証トークンがない場合は、ログイン・登録ページ以外ではログインページにリダイレクトする
  if (!token && !isLoginPage && !isRegisterPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // トークンがあるままログインまたは登録ページにアクセスした場合はホームへ戻す
  if (token && (isLoginPage || isRegisterPage)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 以下で始まるパスを除き、全てのリクエストに適用:
     * - api (API ルート)
     * - _next/static (静的ファイル)
     * - _next/image (画像最適化ファイル)
     * - favicon.ico (ファビコン)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
