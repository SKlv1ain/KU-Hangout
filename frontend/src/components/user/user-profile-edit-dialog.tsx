"use client";

import { CheckIcon, Loader2, Minus, Plus } from "lucide-react";
import { ChangeEvent, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ThreeDCardDemo from "@/components/user/user-profile-3d-card";
import userService, { type UserProfile, type UpdateUserProfileInput } from "@/services/userService";

export const title = "Edit Profile";

interface UserProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile?: UserProfile | null;
  previewUsername?: string;
  onProfileUpdated?: (profile: UserProfile) => void;
}

export default function UserProfileEditDialog({
  open,
  onOpenChange,
  profile,
  previewUsername,
  onProfileUpdated,
}: UserProfileEditDialogProps) {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [socialLinks, setSocialLinks] = useState<string[]>([""]);
  const [bio, setBio] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const maxBioLength = 200;
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputId = useId();

  const displayNameForAvatar = displayName || profile?.display_name || profile?.username || "User";
  const initials = displayNameForAvatar?.[0]?.toUpperCase() || "?";
  const profileImageSrc = imagePreview || profile?.profile_picture_url || "";
  const previewCardUsername = previewUsername || profile?.username;

  const stripProtocol = useCallback((value: string) => value.replace(/^https?:\/\//i, ""), []);

  const toAbsoluteUrl = useCallback((value: string) => {
    if (!value) return "";
    if (/^https?:\/\//i.test(value)) return value;
    return `https://${value}`;
  }, []);

  useEffect(() => {
    const fallbackDisplayName = profile?.display_name || profile?.username || "";

    setDisplayName(fallbackDisplayName);
    setUsername(profile?.username || "");
    const initialLinks = (() => {
      const links = Array.isArray(profile?.social_links) ? (profile?.social_links as string[]) : [];
      if (links.length > 0) {
        return links;
      }
      if (profile?.website) {
        return [profile.website];
      }
      return [];
    })();
    const formattedLinks = initialLinks.map((link) => stripProtocol(link || "")).filter(Boolean);
    setSocialLinks(formattedLinks.length ? formattedLinks : [""]);
    setBio(profile?.bio || "");
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setFormError(null);
  }, [profile, open, stripProtocol]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    const newPreview = URL.createObjectURL(file);
    setImagePreview(newPreview);
    setImageFile(file);
  };

  const handleResetImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const previewProfileData = useMemo(() => {
    const sanitizedLinks = socialLinks
      .map((link) => link.trim())
      .filter(Boolean)
      .map((link) => toAbsoluteUrl(link));

    const data: Partial<UserProfile> & { profile_picture_preview?: string | null } = {
      display_name: displayName,
      username,
      bio,
      website: sanitizedLinks[0] || "",
      social_links: sanitizedLinks,
    };

    if (imagePreview) {
      data.profile_picture_preview = imagePreview;
    }

    return data;
  }, [displayName, username, bio, socialLinks, imagePreview, toAbsoluteUrl]);

  const handleSave = async () => {
    if (!previewCardUsername && !profile?.username) {
      setFormError("ไม่พบข้อมูลผู้ใช้ กรุณาลองใหม่อีกครั้ง");
      return;
    }

    const trimmedDisplayName = displayName.trim();
    if (!trimmedDisplayName) {
      setFormError("Display name is required");
      return;
    }
    if (trimmedDisplayName.length > 50) {
      setFormError("Display name must be 50 characters or fewer");
      return;
    }

    const sanitizedBio = bio;
    const sanitizedLinks = socialLinks
      .map((link) => link.trim())
      .filter(Boolean)
      .map((link) => toAbsoluteUrl(link));
    const websiteValue = sanitizedLinks[0] || "";

    const payload: UpdateUserProfileInput = {
      display_name: trimmedDisplayName,
      bio: sanitizedBio,
      website: websiteValue,
      social_links: sanitizedLinks,
    };

    if (imageFile) {
      payload.profile_picture = imageFile;
    }

    setIsSaving(true);
    setFormError(null);
    try {
      const updatedProfile = await userService.updateUserProfile(previewCardUsername || profile?.username || "", payload);
      toast.success("Profile updated successfully");
      onProfileUpdated?.(updatedProfile);
      handleResetImage();
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update profile";
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 sm:max-w-2xl lg:max-w-4xl">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle>Edit profile</DialogTitle>
        </DialogHeader>
        <div className="px-6 py-6 lg:max-h-[80vh] lg:overflow-y-auto">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profileImageSrc || undefined} alt={displayNameForAvatar} />
                  <AvatarFallback className="text-lg font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">Profile picture</p>
                    <p className="text-sm text-muted-foreground">
                      Upload a new photo to update your avatar.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      ref={fileInputRef}
                      id={fileInputId}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      Change photo
                    </Button>
                    {imagePreview && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleResetImage}
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <Input
                      id="username"
                      value={username}
                      readOnly
                      className="bg-muted/50 text-muted-foreground"
                    />
                    <CheckIcon className="-translate-y-1/2 absolute top-1/2 right-3 h-4 w-4 text-green-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Social accounts</Label>
                  <div className="space-y-2">
                    {socialLinks.map((link, index) => {
                      const isLast = index === socialLinks.length - 1;
                      const canAddMore = socialLinks.length < 4;
                      return (
                        <div key={`social-link-${index}`} className="flex items-center gap-2">
                          <div className="flex flex-1">
                            <div className="flex items-center rounded-l-md border border-input border-r-0 bg-muted px-3 text-muted-foreground text-sm">
                              https://
                            </div>
                            <Input
                              className="rounded-l-none"
                              value={link}
                              onChange={(event) => {
                                const value = stripProtocol(event.target.value);
                                setSocialLinks((prev) => {
                                  const next = [...prev];
                                  next[index] = value;
                                  return next;
                                });
                              }}
                              placeholder="instagram.com/username"
                            />
                          </div>
                          {socialLinks.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSocialLinks((prev) => {
                                  const next = prev.filter((_, i) => i !== index);
                                  return next.length ? next : [""];
                                });
                              }}
                              aria-label="Remove link"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          )}
                          {isLast && canAddMore && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => setSocialLinks((prev) => [...prev, ""])}
                              aria-label="Add link"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                    <p className="text-xs text-muted-foreground">Add up to 4 social links.</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Biography</Label>
                  <Textarea
                    className="min-h-[100px] resize-none"
                    id="bio"
                    maxLength={maxBioLength}
                    onChange={(e) => setBio(e.target.value)}
                    value={bio}
                  />
                  <p className="text-right text-muted-foreground text-xs">
                    {maxBioLength - bio.length} characters left
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">Profile preview</p>
              <div className="rounded-2xl border border-muted bg-muted/40 p-4 lg:max-h-[60vh] lg:overflow-y-auto">
                <ThreeDCardDemo
                  username={previewCardUsername}
                  showEditButton={false}
                  containerClassName="py-0"
                  previewProfile={previewProfileData}
                />
              </div>
            </div>
          </div>
        </div>
        {formError && (
          <div className="px-6 -mt-2 text-sm text-destructive">{formError}</div>
        )}
        <DialogFooter className="px-6 pb-6">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || (!previewCardUsername && !profile?.username)}
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? "Saving" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
