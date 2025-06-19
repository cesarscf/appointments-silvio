import { headers } from "next/headers";
import { auth } from "./auth";
import { Resend } from "resend";

export const getSession = async () =>
  auth.api.getSession({
    headers: headers(),
  });

export * from "./auth";

export const resend = new Resend("re_Z5HyPgYv_LCRMLHo31G1EbB8WKL7PpKgE");
