import React, { useState, useCallback, memo } from "react";
import { useForm, router } from "@inertiajs/react";
import { toast } from "react-toastify";
import Button from "@/Components/ui/button/Button";
import RichTextEditor from "@/Components/form/RichTextEditor";
import RoleBadge from "@/Components/ui/badge/RoleBadge";
import linkifyMentions from "@/utils/mentions";

interface ReplyItemProps {
  reply: any;
  currentUser: any;
  onNestedSubmit: (parentId: any, text: string) => Promise<void>;
  canReply: boolean;
  level?: number;
  usernames: string[];
}

const ReplyItem = memo(function ReplyItem({
  reply,
  currentUser,
  onNestedSubmit,
  canReply,
  level = 0,
  usernames,
}: ReplyItemProps) {
  const [openReply, setOpenReply] = useState(false);
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const authorName = reply.user?.name || reply.user_name || "Unknown User";
  const authorAvatar =
    reply.user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;

    setSubmitting(true);
    try {
      await onNestedSubmit(reply.id, value);
      setValue("");
      setOpenReply(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const renderReplyHtml = (rawHtml: string | undefined) => {
    const safe = rawHtml ?? "";
    const withMentions = linkifyMentions(safe, usernames);
    return { __html: withMentions };
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-start gap-1">
        <img
          src={authorAvatar}
          alt={authorName}
          className={`${level > 0 ? "w-7 h-7" : "w-9 h-9"} rounded-full object-cover border`}
        />
        <div className="flex-1">
          <div className="flex items-center">
            <p className="text-sm font-medium text-gray-800">{authorName}</p>
            <RoleBadge role={reply.user?.role} />
          </div>
          <p className="text-xs text-gray-500">
            {reply.posted_at ? new Date(reply.posted_at).toLocaleString() : ""}
          </p>

          <div
            className="mt-2 text-sm text-gray-700"
            dangerouslySetInnerHTML={renderReplyHtml(reply.reply_text ?? "")}
          />

          {canReply && (
            <div className="mt-2">
              <button
                type="button"
                className="text-xs text-blue-600"
                onClick={() => {
                  setOpenReply((s) => !s);
                  // prefill mention
                  setValue((v) => (v ? v : `@${reply.user?.name ?? reply.user_name ?? ""} `));
                }}
              >
                {openReply ? "Batal" : "Balas"}
              </button>
            </div>
          )}

          {openReply && (
            <form onSubmit={handleSubmit} className="mt-2">
              <RichTextEditor value={value} onChange={(v: string) => setValue(v)} />
              <div className="flex gap-2 justify-end mt-2">
                <Button variant="default" size="sm" type="submit" disabled={submitting}>
                  {submitting ? "Mengirim..." : "Kirim Balasan"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* children (recursively) - Responsive nesting: limit to level 3 on mobile, level 5 on desktop */}
      {reply.children && reply.children.length > 0 && (
        <ul
          className={`mt-3 space-y-2 ${
            level < 2
              ? "pl-6 border-l ml-3 md:ml-4"
              : level < 4
              ? "pl-0 md:pl-6 md:border-l md:ml-4"
              : "pl-0"
          }`}
        >
          {reply.children.map((child: any) => (
            <ReplyItem
              key={child.id}
              reply={child}
              currentUser={currentUser}
              onNestedSubmit={onNestedSubmit}
              canReply={canReply}
              level={level + 1}
              usernames={usernames}
            />
          ))}
        </ul>
      )}
    </div>
  );
});

export default ReplyItem;
