import { z } from 'zod';

/**
 * Customer Order Form Zod Validation Schema
 */
export const OrderFormSchema = z
  .object({
    customer_name: z.string().min(2, 'Name must be at least 2 characters'),
    customer_phone: z
      .string()
      .min(8, 'Phone number must be at least 8 digits')
      .regex(/^[0-9+\s-]+$/, 'Invalid phone number format'),
    fulfillment_type: z.enum(['delivery', 'pickup']),
    delivery_address: z.string().optional(),
    notes: z.string().optional(),
    telegram_chat_id: z.string().optional(),
    items: z
      .array(
        z.object({
          food_id: z.number().int().positive(),
          quantity: z.number().int().min(1, 'Quantity must be at least 1'),
        })
      )
      .min(1, 'Cart must contain at least 1 food item'),
  })
  .superRefine((data, ctx) => {
    if (data.fulfillment_type === 'delivery') {
      if (!data.delivery_address || data.delivery_address.trim().length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Delivery address is required for delivery orders (min 5 chars)',
          path: ['delivery_address'],
        });
      }
    }
  });

export type OrderFormInput = z.infer<typeof OrderFormSchema>;

/**
 * Admin Food Item Zod Validation Schema
 */
export const FoodFormSchema = z.object({
  name: z.string().min(2, 'Food name must be at least 2 characters'),
  price: z.number().positive('Price must be greater than 0'),
  category_id: z.number().int().optional(),
  description: z.string().optional(),
  image_url: z.string().url('Invalid image URL format').optional().or(z.literal('')),
  is_available: z.boolean().default(true),
  status: z.enum(['public', 'draft']).default('public'),
});

export type FoodFormInput = z.infer<typeof FoodFormSchema>;

/**
 * System Log Retention Cleanup Zod Schema
 */
export const LogRetentionSchema = z.object({
  days: z.number().int().min(0, 'Days cannot be negative'),
  reason: z.string().optional(),
});

export type LogRetentionInput = z.infer<typeof LogRetentionSchema>;
