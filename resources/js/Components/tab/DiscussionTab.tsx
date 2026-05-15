// file: resources/js/Components/tab/DiscussionTab.tsx
import { useState, useCallback } from "react";
import { usePage, router, Link } from "@inertiajs/react";
import { toast } from "react-toastify";
import Button from "@/Components/ui/button/Button";
import Badge from "@/Components/ui/badge/Badge";
import EmptyState from "@/Components/empty/EmptyState";
import RichTextEditor from "@/Components/form/RichTextEditor";
import Label from "@/Components/form/Label";
import Input from "@/Components/form/input/InputField";
import { DiscussionTabProps } from "@/types/types";

const RoleBadge = ({ role }: { role?: string }) => {
  if (role === "admin") {
    return <Badge color="error" size="sm" className="ml-2 uppercase text-[10px] px-1.5 py-0 rounded font-bold">Admin</Badge>;
  }
  if (role === "mentor") {
    return <Badge color="info" size="sm" className="ml-2 uppercase text-[10px] px-1.5 py-0 rounded font-bold">Mentor</Badge>;
  }
  return null;
};

export default function DiscussionTab({ classData }: DiscussionTabProps) {
  const { props }: any = usePage();
  const user = props?.auth?.user;
  const enrolled = props?.class?.enrollments?.some(
    (e: any) => e.student.id === user?.id
  );

  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const discussions = classData.discussions ?? [];

  const handleStartCreate = useCallback(() => {
    if (!enrolled) {
      return;
    }
    setCreating(true);
    setTitle("");
    setDescription("");
  }, [enrolled]);

  const handleCancelCreate = useCallback(() => {
    setCreating(false);
    setTitle("");
    setDescription("");
  }, []);

  const handleSubmitCreate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim()) {
        return;
      }
      if (!description || description.trim() === "" || description === "<p><br></p>") {
        return;
      }

      setLoading(true);

      router.post(
        route("discussions.store", { class: classData.id }),
        { title, description },
        {
          onSuccess: () => {
            setCreating(false);
            toast.success("Topik diskusi berhasil dibuat.");
          },
          onError: (errors: any) => {
            if (errors.title) {
              toast.error(errors.title);
            } else if (errors.description) {
              toast.error(errors.description);
            }
          },
          onFinish: () => setLoading(false),
        }
      );
    },
    [title, description, classData.id]
  );

  return (
    <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800">
          Forum Diskusi
        </h2>
        <div>
          <Button
            variant="outlineDash"
            size="sm"
            onClick={handleStartCreate}
          >
            + Buat Topik
          </Button>
        </div>
      </div>

      <div className="mt-4">
        {creating ? (
          <form onSubmit={handleSubmitCreate}>
            <Label required>Topik Diskusi</Label>
            <Input
              placeholder="Judul topik..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Label className="mt-4" required>
              Pesan
            </Label>
            <RichTextEditor
              value={description}
              onChange={(v: string) => setDescription(v)}
            />
            <div className="flex gap-2 justify-end mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelCreate}
                type="button"
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="default"
                size="sm"
                disabled={loading}
              >
                {loading ? "Menyimpan..." : "Publikasikan"}
              </Button>
            </div>
          </form>
        ) : (
          <>
            {discussions.length === 0 ? (
              <EmptyState
                title="Belum ada diskusi"
                description="Belum ada topik diskusi. Tekan 'Buat Topik' untuk memulai percakapan."
              />
            ) : (
              <ul className="mt-4 space-y-3">
                {discussions.map((d: any) => {
                  const authorName = d.opener_student?.name || "Unknown";
                  const authorAvatar =
                    d.opener_student?.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      authorName
                    )}`;

                  return (
                    <li
                      key={d.id}
                      className="border rounded-lg p-4 hover:shadow-sm transition"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex gap-3">
                          <img
                            src={authorAvatar}
                            alt={authorName}
                            className="w-10 h-10 rounded-full object-cover border"
                          />
                          <div>
                            <Link
                              href={route("discussions.show", {
                                class: classData.id,
                                discussion: d.id,
                              })}
                              className="text-primary font-medium hover:underline"
                            >
                              {d.title}
                            </Link>
                            <p className="text-xs text-gray-500 mt-1 flex items-center">
                              <span>oleh {authorName}</span>
                              <RoleBadge role={d.opener_student?.role} />
                              <span className="mx-1">•</span>
                              <span>{new Date(d.created_at).toLocaleDateString()}</span>
                            </p>
                            <p
                              className="text-sm text-gray-600 mt-2 line-clamp-2"
                              dangerouslySetInnerHTML={{
                                __html:
                                  d.excerpt ??
                                  d.description ??
                                  "",
                              }}
                            />
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              d.status === "open"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {d.status === "open"
                              ? "Open"
                              : "Closed"}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}
