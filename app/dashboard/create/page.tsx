"use client";

import { handleSubmission } from "@/app/actions";
import { Submitbutton } from "@/components/general/Submitbutton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateBlogroute() {
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    console.log("Form submission started");

    const formData = new FormData(e.currentTarget);

    console.log("Form data:", formData);

    try {
      const result = await handleSubmission(formData);

      console.log("Result:", result);

      // Jika server action return error object (bukan redirect)
      if (result.success) {
        // Redirect ke halaman lain atau lakukan tindakan lainnya
        router.push("/dashboard");
        router.refresh();
      } else {
        console.log("Error:", result.error);
        setError(result.error || "Failed to create a new post");
      }
    } catch (err) {
      console.error("Form submission error:", err);
      setError("An unexpected error occurred");
    } finally {
      console.log("Form submission completed");
      setIsSubmitting(false);
    }
  };

  // Client-side validation untuk UX yang lebih baik
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
      if (file.size > MAX_FILE_SIZE) {
        setError("File size exceeds the maximum limit of 1MB");
        e.target.value = ""; // Reset input file
      } else if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed");
        e.target.value = ""; // Reset input file
      } else {
        setError("");
      }
    }
  };

  return (
    <div>
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Create Post</CardTitle>
          <CardDescription>
            Create a new post to share with the world
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleFormSubmit}>
            <div className="flex flex-col gap-2">
              <Label>Title</Label>
              <Input
                name="title"
                required
                type="text"
                placeholder="Title"
                disabled={isSubmitting}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Content</Label>
              <Textarea
                name="content"
                required
                placeholder="Content"
                disabled={isSubmitting}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Upload Image (Max 1MB)</Label>
              <Input
                name="img"
                required
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500">
                Supported formats: JPG, PNG, GIF, WEBP. Maximum size: 1MB
              </p>
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-2 rounded border border-red-200">
                {error}
              </div>
            )}

            <Submitbutton disabled={isSubmitting} />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
