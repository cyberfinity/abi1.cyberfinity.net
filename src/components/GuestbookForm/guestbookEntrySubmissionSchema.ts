import { z } from "astro/zod";

export const guestbookEntrySubmissionSchema = z
  .object({
    name: z.string(),
    remember: z
      .literal("on")
      .optional()
      .transform((val) => val === "on"),
    iconType: z.enum(["builtin", "gravatar"]),
    builtinIcon: z.string().optional(),
    gravatarEmail: z.string().email().optional(),
    comment: z.string(),
  })
  .and(
    z.union(
      [
        z.object({
          iconType: z.literal("gravatar"),
          builtinIcon: z.string().optional(),
          gravatarEmail: z.string().email(),
        }),
        z.object({
          iconType: z.literal("builtin"),
          builtinIcon: z.string(),
          gravatarEmail: z.string().email().optional(),
        }),
      ],
      {
        errorMap: (_issue, _ctx) => ({
          message: "Either gravatar email or built-in icon must be filled in",
        }),
      },
    ),
  );

export type GuestbookEntrySubmission = z.infer<
  typeof guestbookEntrySubmissionSchema
>;

/**
 * Parses and validates submitted form data.
 *
 * Throws if the data is invalid
 *
 * @param formData
 * @returns
 */
export function parseGuestbookEntryFormData(
  formData: FormData,
): GuestbookEntrySubmission {
  const formDataValues: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    const trimmedValue =
      typeof value === "string" ? value.trim() || undefined : value;
    formDataValues[key] = trimmedValue;
  }

  return guestbookEntrySubmissionSchema.parse(formDataValues);
}
