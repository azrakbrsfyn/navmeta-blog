"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { prisma } from "./utils/db";
import { revalidatePath } from "next/cache";
import { getUploadAuthParams } from "@imagekit/next/server";

// Fungsi untuk upload ke ImageKit
async function uploadToImageKit(file: File): Promise<string> {
  // Validasi file size (1MB)
  const MAX_FILE_SIZE = 1 * 1024 * 1024;
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File size exceeds the maximum limit of 1MB");
  }

  // Validasi tipe file
  if (!file.type.startsWith('image/')) {
    throw new Error("Only image files are allowed");
  }

  try {
    // Convert File to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate upload authentication parameters
    const { token, expire, signature } = getUploadAuthParams({
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
    });

    // Upload ke ImageKit menggunakan fetch API
    const formData = new FormData();
    formData.append('file', new Blob([buffer]), file.name);
    formData.append('fileName', `blog-${Date.now()}-${file.name}`);
    formData.append('folder', '/blog-images');
    formData.append('token', token);
    formData.append('expire', String(expire));
    formData.append('signature', signature);
    formData.append('publicKey', process.env.IMAGEKIT_PUBLIC_KEY!);

    const uploadResponse = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      throw new Error(errorData.message || 'Upload failed');
    }

    const uploadData = await uploadResponse.json();
    return uploadData.url;

  } catch (error) {
    console.error('ImageKit upload error:', error);
    throw new Error('Failed to upload image to ImageKit');
  }
}

export async function handleSubmission(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  
  if (!user) {
    return { success: false, error: "Unauthorized - Please login first" };
  }

  try {
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const imageFile = formData.get("img") as File;

    // console.log("Server action started:", { title, content, imageFile: imageFile?.name });

    // Validasi input required
    if (!title || !content || !imageFile) {
      return { success: false, error: "All fields are required" };
    }

    // Upload gambar ke ImageKit
    // console.log("Uploading image to ImageKit...");
    const imageUrl = await uploadToImageKit(imageFile);
    // console.log("Image uploaded successfully:", imageUrl);

    // Simpan ke database
    // console.log("Saving to database...");
    await prisma.blogPost.create({
      data: {
        title,
        content,
        imageUrl,
        authorId: user.id,
        authorImage: user.picture as string,
        authorName: user.given_name as string,
      },
    });

    // console.log("Database save successful!");

    revalidatePath("/");
    return { success: true };

  } catch (error) {
    console.error("Submission error:", error);
    
    // Return error message yang bisa ditangkap di client
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}