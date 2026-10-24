// No Next.js here: the Map never navigates on its own in the prototype.
export const useRouter = () => ({ push() {}, replace() {}, refresh() {}, back() {}, prefetch() {} });
export const usePathname = () => "/graph";
export const useSearchParams = () => new URLSearchParams();
export const redirect = () => {};
