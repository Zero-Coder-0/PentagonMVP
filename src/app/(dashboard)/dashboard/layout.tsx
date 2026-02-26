export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // Just render the children, or wrap them in a div if you need shared UI like a sidebar
    // DO NOT use <html> or <body> here
    <div className="w-full h-full">
      {children}
    </div>
  )
}
