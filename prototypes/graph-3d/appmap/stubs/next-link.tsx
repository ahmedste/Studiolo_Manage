// next/link outside Next.js: a plain anchor that keeps the props the map uses.
import type { AnchorHTMLAttributes, ReactNode } from "react";
export default function Link({ href, children, prefetch: _p, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; prefetch?: boolean; children?: ReactNode }) {
  return <a href={href} {...rest}>{children}</a>;
}
