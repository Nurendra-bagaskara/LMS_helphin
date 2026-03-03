export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="
        min-h-screen
        bg-[url('/images/loginSuperAdmin.svg')]
        bg-cover
        bg-center
        flex
        items-center
        justify-end
      "
    >
      {children}
    </div>
  );
}