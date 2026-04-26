/*
 * shared page header used at the top of every content page
 * gives every page the same title size, subtitle treatment, and optional action slot
 * pass an optional backLink to render a breadcrumb above the title (used by detail pages)
 */
export default function PageHeader({ title, subtitle, action, backLink }) {
  return (
    <div className="mb-6">
      {backLink}
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
