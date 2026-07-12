// ============================================================
// services/user.service.ts — User profile and account management
// ============================================================
import { db } from "@/lib/db"
import { logger } from "@/utils/logger"
import { ServiceError } from "./order.service"
import type {
  UpdateProfileInput,
  SubmitKYCInput,
  UpdateRiskProfileInput,
  AddBankAccountInput,
  UpdateBankAccountInput,
  CreateTradingAccountInput,
  UpdateNotificationPreferenceInput,
} from "@/validators/profile.schema"

export class UserService {
  // ── User Profile ──────────────────────────────────────────

  async getProfile(userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        kycRecord: {
          include: { documents: true },
        },
        riskProfile: true,
      },
    })

    if (!user) {
      throw new ServiceError("User not found", "USER_NOT_FOUND", 404)
    }

    return user
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    // Ensure profile exists
    const existing = await db.userProfile.findUnique({ where: { userId } })

    if (existing) {
      return db.userProfile.update({
        where: { userId },
        data: {
          ...(input.dateOfBirth && { dateOfBirth: input.dateOfBirth }),
          ...(input.bio !== undefined && { bio: input.bio }),
          ...(input.country && { country: input.country }),
          ...(input.state && { state: input.state }),
          ...(input.city && { city: input.city }),
          ...(input.address && { address: input.address }),
          ...(input.postalCode && { postalCode: input.postalCode }),
          ...(input.nationality && { nationality: input.nationality }),
          ...(input.occupation && { occupation: input.occupation }),
          ...(input.annualIncome && { annualIncome: input.annualIncome }),
          ...(input.netWorth && { netWorth: input.netWorth }),
          ...(input.investmentGoals && { investmentGoals: input.investmentGoals }),
        },
      })
    } else {
      return db.userProfile.create({
        data: {
          userId,
          dateOfBirth: input.dateOfBirth,
          bio: input.bio,
          country: input.country,
          state: input.state,
          city: input.city,
          address: input.address,
          postalCode: input.postalCode,
          nationality: input.nationality,
          occupation: input.occupation,
          annualIncome: input.annualIncome,
          netWorth: input.netWorth,
          investmentGoals: input.investmentGoals,
        },
      })
    }
  }

  async completeOnboarding(userId: string, step: number) {
    await db.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        onboardingStep: step,
      },
      update: {
        onboardingStep: step,
        ...(step >= 5 && { onboardingDoneAt: new Date() }), // Assuming 5 steps
      },
    })

    // Update user status to ACTIVE when onboarding complete
    if (step >= 5) {
      await db.user.update({
        where: { id: userId },
        data: { status: "ACTIVE" },
      })

      logger.info({ userId }, "User onboarding completed")
    }
  }

  // ── KYC Management ────────────────────────────────────────

  async submitKYC(userId: string, input: SubmitKYCInput) {
    // Create or update KYC record
    const kycRecord = await db.kYCRecord.upsert({
      where: { userId },
      create: {
        userId,
        status: "PENDING",
        level: input.level,
        submittedAt: new Date(),
      },
      update: {
        status: "PENDING",
        level: input.level,
        submittedAt: new Date(),
        rejectionReason: null,
      },
    })

    // Add documents
    await Promise.all(
      input.documents.map((doc) =>
        db.kYCDocument.create({
          data: {
            kycRecordId: kycRecord.id,
            docType: doc.docType,
            docNumber: doc.docNumber,
            fileUrl: doc.fileUrl,
            fileHash: doc.fileHash,
            mimeType: doc.mimeType,
            issuedAt: doc.issuedAt,
            expiresAt: doc.expiresAt,
            status: "pending",
          },
        })
      )
    )

    logger.info({ userId, kycRecordId: kycRecord.id, level: input.level }, "KYC submitted")
    return kycRecord
  }

  async getKYCStatus(userId: string) {
    return db.kYCRecord.findUnique({
      where: { userId },
      include: { documents: true },
    })
  }

  // ── Risk Profile ──────────────────────────────────────────

  async getRiskProfile(userId: string) {
    return db.riskProfile.findUnique({
      where: { userId },
    })
  }

  async updateRiskProfile(userId: string, input: UpdateRiskProfileInput) {
    const existing = await db.riskProfile.findUnique({ where: { userId } })

    if (existing) {
      return db.riskProfile.update({
        where: { userId },
        data: {
          ...(input.riskLevel && { riskLevel: input.riskLevel }),
          ...(input.maxPositionSize && { maxPositionSize: input.maxPositionSize }),
          ...(input.maxDailyLoss && { maxDailyLoss: input.maxDailyLoss }),
          ...(input.allowedAssets && { allowedAssets: input.allowedAssets }),
          ...(input.marginEnabled !== undefined && { marginEnabled: input.marginEnabled }),
          ...(input.shortSellingAllowed !== undefined && {
            shortSellingAllowed: input.shortSellingAllowed,
          }),
          ...(input.optionsLevel !== undefined && { optionsLevel: input.optionsLevel }),
          assessedAt: new Date(),
        },
      })
    } else {
      // Create with defaults
      return db.riskProfile.create({
        data: {
          userId,
          riskLevel: input.riskLevel ?? "MODERATE",
          score: 50,
          maxPositionSize: input.maxPositionSize ?? 10, // 10% default
          maxDailyLoss: input.maxDailyLoss ?? 5, // 5% default
          allowedAssets: input.allowedAssets ?? ["EQUITY", "ETF"],
          marginEnabled: input.marginEnabled ?? false,
          shortSellingAllowed: input.shortSellingAllowed ?? false,
          optionsLevel: input.optionsLevel ?? 0,
          assessedAt: new Date(),
        },
      })
    }
  }

  // ── Bank Accounts ─────────────────────────────────────────

  async listBankAccounts(userId: string) {
    return db.bankAccount.findMany({
      where: { userId, isActive: true },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
    })
  }

  async addBankAccount(userId: string, input: AddBankAccountInput) {
    // If setting as primary, unset other primary accounts
    if (input.isPrimary) {
      await db.bankAccount.updateMany({
        where: { userId, isPrimary: true },
        data: { isPrimary: false },
      })
    }

    // In production, encrypt accountNumber before storing
    const account = await db.bankAccount.create({
      data: {
        userId,
        accountHolder: input.accountHolder,
        bankName: input.bankName,
        accountNumber: input.accountNumber, // TODO: Encrypt in production
        ifscCode: input.ifscCode,
        routingNumber: input.routingNumber,
        accountType: input.accountType,
        currency: input.currency,
        isPrimary: input.isPrimary,
        isVerified: false,
      },
    })

    logger.info({ userId, bankAccountId: account.id }, "Bank account added")
    return account
  }

  async updateBankAccount(userId: string, accountId: string, input: UpdateBankAccountInput) {
    const account = await db.bankAccount.findFirst({
      where: { id: accountId, userId },
    })

    if (!account) {
      throw new ServiceError("Bank account not found", "BANK_ACCOUNT_NOT_FOUND", 404)
    }

    // If setting as primary, unset other primary accounts
    if (input.isPrimary) {
      await db.bankAccount.updateMany({
        where: { userId, isPrimary: true, id: { not: accountId } },
        data: { isPrimary: false },
      })
    }

    return db.bankAccount.update({
      where: { id: accountId },
      data: {
        ...(input.isPrimary !== undefined && { isPrimary: input.isPrimary }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
    })
  }

  async deleteBankAccount(userId: string, accountId: string): Promise<void> {
    const account = await db.bankAccount.findFirst({
      where: { id: accountId, userId },
    })

    if (!account) {
      throw new ServiceError("Bank account not found", "BANK_ACCOUNT_NOT_FOUND", 404)
    }

    await db.bankAccount.delete({ where: { id: accountId } })
    logger.info({ userId, bankAccountId: accountId }, "Bank account deleted")
  }

  // ── Trading Accounts ──────────────────────────────────────

  async listTradingAccounts(userId: string) {
    return db.tradingAccount.findMany({
      where: { userId, status: { not: "CLOSED" } },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    })
  }

  async createTradingAccount(userId: string, input: CreateTradingAccountInput) {
    // Generate unique account number
    const accountNumber = `TA${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    // Check if this is the first account
    const existingCount = await db.tradingAccount.count({
      where: { userId, status: { not: "CLOSED" } },
    })

    const isFirstAccount = existingCount === 0

    const account = await db.tradingAccount.create({
      data: {
        userId,
        accountNumber,
        type: input.type,
        currency: input.currency,
        status: "ACTIVE",
        isDefault: isFirstAccount, // First account is default
        cashBalance: input.type === "DEMO" ? 100000 : 0, // Demo accounts get virtual cash
        buyingPower: input.type === "DEMO" ? 100000 : 0,
      },
    })

    logger.info(
      { userId, accountId: account.id, accountNumber, type: input.type },
      "Trading account created"
    )
    return account
  }

  async setDefaultAccount(userId: string, accountId: string) {
    const account = await db.tradingAccount.findFirst({
      where: { id: accountId, userId, status: { not: "CLOSED" } },
    })

    if (!account) {
      throw new ServiceError("Trading account not found", "ACCOUNT_NOT_FOUND", 404)
    }

    // Unset other defaults
    await db.tradingAccount.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    })

    // Set new default
    return db.tradingAccount.update({
      where: { id: accountId },
      data: { isDefault: true },
    })
  }

  // ── Notification Preferences ──────────────────────────────

  async getNotificationPreferences(userId: string) {
    return db.notificationPreference.findMany({
      where: { userId },
      orderBy: [{ type: "asc" }, { channel: "asc" }],
    })
  }

  async updateNotificationPreferences(
    userId: string,
    input: UpdateNotificationPreferenceInput
  ) {
    // Upsert all preferences
    await Promise.all(
      input.preferences.map((pref) =>
        db.notificationPreference.upsert({
          where: {
            userId_type_channel: {
              userId,
              type: pref.type,
              channel: pref.channel,
            },
          },
          create: {
            userId,
            type: pref.type,
            channel: pref.channel,
            enabled: pref.enabled,
          },
          update: {
            enabled: pref.enabled,
          },
        })
      )
    )

    logger.info({ userId, count: input.preferences.length }, "Notification preferences updated")
    return this.getNotificationPreferences(userId)
  }

  // ── Notifications ─────────────────────────────────────────

  async listNotifications(userId: string, limit = 50) {
    return db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    })
  }

  async markNotificationRead(userId: string, notificationId: string) {
    const notification = await db.notification.findFirst({
      where: { id: notificationId, userId },
    })

    if (!notification) {
      throw new ServiceError("Notification not found", "NOTIFICATION_NOT_FOUND", 404)
    }

    return db.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    })
  }

  async markAllNotificationsRead(userId: string) {
    const result = await db.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    })

    return result.count
  }

  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    const notification = await db.notification.findFirst({
      where: { id: notificationId, userId },
    })

    if (!notification) {
      throw new ServiceError("Notification not found", "NOTIFICATION_NOT_FOUND", 404)
    }

    await db.notification.delete({ where: { id: notificationId } })
  }

  // ── User Settings ─────────────────────────────────────────

  async updateSettings(userId: string, settings: { timezone?: string; locale?: string }) {
    return db.user.update({
      where: { id: userId },
      data: {
        ...(settings.timezone && { timezone: settings.timezone }),
        ...(settings.locale && { locale: settings.locale }),
      },
    })
  }
}

export const userService = new UserService()
