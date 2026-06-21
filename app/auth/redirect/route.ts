import { NextRequest, NextResponse } from "next/server";

function redirectToDashboard(request: NextRequest) {
  return NextResponse.redirect(new URL("/", request.url), 303);
}

export function GET(request: NextRequest) {
  return redirectToDashboard(request);
}

export function POST(request: NextRequest) {
  return redirectToDashboard(request);
}
