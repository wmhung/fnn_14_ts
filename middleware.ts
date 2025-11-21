// v1
export default function middleware(req) {
  console.log(req.url);
}
export const config = { matcher: '/((?!.*\\.).*)' };
