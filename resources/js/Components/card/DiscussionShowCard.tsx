// resources/js/Pages/Classes/DiscussionShow.tsx
import React, { useState, useCallback, memo } from "react";
import { useForm, usePage, router } from "@inertiajs/react";
import { toast } from "react-toastify";
import PageBreadcrumb from "@/Components/ui/breadcrumb/Breadcrumb";
import Button from "@/Components/ui/button/Button";
import RichTextEditor from "@/Components/form/RichTextEditor";
import Badge from "@/Components/ui/badge/Badge";
import { confirmDialog } from "@/utils/confirmationDialog";
import { createMarkup } from "@/utils/htmlMarkup";
import EmptyState from "@/Components/empty/EmptyState";
import linkifyMentions from "@/utils/mentions";
import ReplyItem from "./discussion/ReplyItem";
import RoleBadge from "@/Components/ui/badge/RoleBadge";

export default function DiscussionShowCard() {
  const { props }: any = usePage();
  const discussion = props?.discussion ?? null;
  const classData = props?.class ?? null;
  const auth = props?.auth ?? null;
  const user = auth?.user ?? null;

  if (!discussion || !classData) {
    return (
      <div className="container mx-auto mt-6">
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold">Diskusi</h2>
          <p className="text-sm text-gray-500 mt-2">Diskusi tidak ditemukan atau masih dimuat...</p>
        </div>
      </div>
    );
  }

  const discussionId = discussion.id;
  const classId = classData.id;
  const openerId = discussion.opener_student_id ?? discussion.opener_student?.id;
  const isOpener = openerId === user?.id;
  const isMentorOrAdmin = user?.role === "mentor" || user?.role === "admin";
  const isOpen = discussion.status === "open";

  // Extract all usernames from enrolled students, mentor, and ALL repliers
  const usernames: string[] = [];

  // 1. Enrolled students
  if (classData.enrollments) {
    classData.enrollments.forEach((enrollment: any) => {
      if (enrollment.student?.name) {
        usernames.push(enrollment.student.name);
      }
    });
  }

  // 2. Class mentor
  if (classData.mentor?.name) {
    if (!usernames.includes(classData.mentor.name)) {
      usernames.push(classData.mentor.name);
    }
  }

  // 3. Discussion opener
  if (discussion.opener_student?.name) {
    if (!usernames.includes(discussion.opener_student.name)) {
      usernames.push(discussion.opener_student.name);
    }
  }

  // 4. All repliers (recursive helper)
  const collectRepliers = (replies: any[]) => {
    replies.forEach((r) => {
      const name = r.user?.name || r.user_name;
      if (name && !usernames.includes(name)) {
        usernames.push(name);
      }
      if (r.children && r.children.length > 0) {
        collectRepliers(r.children);
      }
    });
  };

  if (discussion.discussion_replies) {
    collectRepliers(discussion.discussion_replies);
  }

  // top-level reply
  const { data, setData, post, processing } = useForm<{ reply_text: string }>({ reply_text: "" });

  const handleTopLevelSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!isOpen) {
        return;
      }
      if (!data.reply_text || data.reply_text.trim() === "" || data.reply_text === "<p><br></p>") {
        return;
      }

      post(
        route("discussions.discussionReplies.store", { class: classId, discussion: discussionId }),
        {
          onSuccess: () => {
            setData("reply_text", "");
            router.reload({ only: ["discussion"] });
          },
          onError: (errors: any) => {
            if (errors.reply_text) {
              toast.error(errors.reply_text);
            }
          },
        }
      );
    },
    [data.reply_text, isOpen, classId, discussionId, setData, post]
  );

  // centralized nested submit handler used by ReplyItem
  const onNestedSubmit = async (parentId: any, text: string) => {
    return new Promise<void>((resolve, reject) => {
      router.post(
        route("discussions.discussionReplies.store", { class: classId, discussion: discussionId }),
        { reply_text: text, parent_id: parentId },
        {
          onSuccess: () => {
            // reload just the discussion prop
            router.reload({ only: ["discussion"] });
            resolve();
          },
          onError: (errors: any) => {
            if (errors.reply_text) {
              toast.error(errors.reply_text);
            }
            reject(new Error("failed"));
          },
        }
      );
    });
  };

  return (
    <div className="container mx-auto">
      <PageBreadcrumb
        crumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Kelasku", href: "/classes" },
          { label: classData?.name ?? "Class", href: classData ? `/classes/${classData.id}` : undefined },
          { label: "Diskusi", href: classData ? `/classes/${classData.id}/discussions` : undefined },
          { label: discussion.title ?? "Diskusi", href: classData ? `/classes/${classData.id}/discussions/${discussion.id}` : undefined },
        ]}
      />

      <div className="bg-white rounded-lg border p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-start gap-3 flex-grow">
            <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden border bg-gray-100">
              <img
                src={discussion.opener_student?.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(discussion.opener_student?.name ?? "Unknown")}`}
                alt={discussion.opener_student?.name ?? "Unknown"}
                className="w-full h-full object-cover aspect-square"
              />
            </div>

            <div className="flex flex-col">
              <h1 className="text-xl md:text-2xl font-bold leading-snug break-words">{discussion.title}</h1>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <span>oleh</span>
                <span className="font-medium mx-1 text-gray-800">{discussion.opener_student?.name ?? "Unknown"}</span>
                <RoleBadge role={discussion.opener_student?.role} />
                <span className="mx-1">•</span>
                <span>{discussion.created_at ? new Date(discussion.created_at).toLocaleString() : ""}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${isOpen ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"}`}>
              {isOpen ? "Open" : "Closed"}
            </span>
            {(isOpener || isMentorOrAdmin) && isOpen && (
              <Button
                variant="danger"
                size="sm"
                onClick={async () => {
                  const confirmed = await confirmDialog({
                    title: "Tutup diskusi?",
                    text: "Setelah ditutup, peserta tidak dapat menambahkan balasan lagi.",
                    confirmButtonText: "Tutup",
                    cancelButtonText: "Batal",
                  });
                  if (!confirmed) return;
                  router.patch(route("discussions.updateStatus", { class: classId, discussion: discussionId }), {}, {
                    onSuccess: () => {
                      router.reload({ only: ["discussion"] });
                    },
                  });
                }}
              >
                Tutup Diskusi
              </Button>
            )}
          </div>
        </div>

        {/* Discussion content */}
        <div className="mt-4 prose max-w-none" dangerouslySetInnerHTML={createMarkup(discussion.description ?? "")} />

        {/* Replies */}
        <div className="mt-6 pt-4">
          <h3 className="font-semibold">Balasan</h3>

          {discussion.discussion_replies && discussion.discussion_replies.length > 0 ? (
            <ul className="mt-4 space-y-4">
              {discussion.discussion_replies.map((r: any) => (
                <ReplyItem key={r.id} reply={r} currentUser={user} onNestedSubmit={onNestedSubmit} canReply={isOpen} usernames={usernames} />
              ))}
            </ul>
          ) : (
            <div className="mt-4">
              <EmptyState title="Belum ada balasan" description="Jadilah yang pertama untuk membalas diskusi ini." />
            </div>
          )}
        </div>

        {/* Add top-level reply */}
        <div className="mt-6 pt-4">
          <h4 className="font-medium mb-2">Tambahkan Balasan</h4>
          {!isOpen ? (
            <p className="text-sm text-gray-500">Diskusi ini telah ditutup — Anda tidak dapat menambahkan balasan.</p>
          ) : (
            <form onSubmit={handleTopLevelSubmit}>
              <RichTextEditor value={data.reply_text} onChange={(v: string) => setData("reply_text", v)} />
              <div className="flex gap-2 justify-end mt-3">
                <Button variant="default" size="sm" type="submit" disabled={processing}>
                  {processing ? "Mengirim..." : "Kirim Balasan"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
