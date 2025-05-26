import { signIn } from "./actions";

export const runtime = "edge";

export default function SignInPage() {
  return <button onClick={signIn}>Sign In</button>;
}
