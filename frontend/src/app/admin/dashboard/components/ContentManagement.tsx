import React from "react";

interface ContentManagementProps {
  siteContent: {
    aboutHeading: string;
    aboutBody: string;
    aboutImage: string;
  };
  setSiteContent: (updater: (prev: any) => any) => void;
  bgCard?: string;
  borderColor?: string;
  headingFont?: string;
  textSecondary?: string;
}

export const ContentManagement: React.FC<ContentManagementProps> = ({
  siteContent,
  setSiteContent,
  bgCard = "bg-card",
  borderColor = "border-default",
  headingFont = "font-heading",
  textSecondary = "text-secondary",
}) => {
  return (
    <div className={`${bgCard} p-6 rounded-lg shadow-md border ${borderColor}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h3 className={`text-2xl font-semibold text-accent ${headingFont}`}>Content Management</h3>
          <p className={`${textSecondary} text-sm`}>
            Edit client-facing copy and imagery for the About section.
          </p>
        </div>
        <span className="text-xs text-muted bg-card/5 border border-default rounded-md px-3 py-1">Local preview</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label className="text-sm text-muted flex flex-col gap-2">
            Section Heading
            <input
              type="text"
              value={siteContent.aboutHeading}
              onChange={(e) => setSiteContent((prev: any) => ({ ...prev, aboutHeading: e.target.value }))}
              className="bg-muted border border-default rounded-md px-3 py-2 text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </label>
          <label className="text-sm text-muted flex flex-col gap-2">
            Body Copy
            <textarea
              value={siteContent.aboutBody}
              onChange={(e) => setSiteContent((prev: any) => ({ ...prev, aboutBody: e.target.value }))}
              rows={6}
              className="bg-muted border border-default rounded-md px-3 py-2 text-primary focus:outline-none focus:ring-2 focus:ring-accent resize-none"
            />
          </label>
          <label className="text-sm text-muted flex flex-col gap-2">
            Image URL
            <input
              type="url"
              value={siteContent.aboutImage}
              onChange={(e) => setSiteContent((prev: any) => ({ ...prev, aboutImage: e.target.value }))}
              className="bg-muted border border-default rounded-md px-3 py-2 text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </label>
        </div>
        <div className="border border-default rounded-lg bg-card/5 overflow-hidden">
          <div className="p-4 border-b border-default flex items-center justify-between">
            <h4 className="text-lg font-semibold text-accent">Preview</h4>
            <span className="text-xs text-muted">About Us section</span>
          </div>
          <div className="p-4 space-y-4">
            <div className="aspect-video w-full rounded-md overflow-hidden bg-muted border border-default">
              {siteContent.aboutImage ? (
                <img src={siteContent.aboutImage} alt="About section" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted text-sm">Image preview</div>
              )}
            </div>
            <div className="space-y-2">
              <h5 className="text-xl font-semibold text-primary">{siteContent.aboutHeading || "About Us"}</h5>
              <p className="text-secondary text-sm leading-relaxed">{siteContent.aboutBody || "No content yet."}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 text-sm text-muted bg-card/5 border border-default rounded-md p-4">
        <p className="font-semibold text-accent mb-1">Notes</p>
        <p>Values are stored locally for now. Wire this form to your API or CMS to persist updates to the live site.</p>
      </div>
    </div>
  );
};
