import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    })

    if (adminUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const kycStatus = searchParams.get('kycStatus')
    const search = searchParams.get('search')

    // Build query filters
    const where: any = {}
    
    if (status) {
      where.accountStatus = status
    }
    
    if (kycStatus) {
      where.kycStatus = kycStatus
    }
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Fetch users with aggregated data
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        clerkId: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        kycStatus: true,
        accountStatus: true,
        balance: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calculate total volume for each user
    const usersWithVolume = await Promise.all(
      users.map(async (user) => {
        const orders = await prisma.order.aggregate({
          where: {
            userId: user.id,
            status: { in: ['FILLED', 'PARTIALLY_FILLED'] },
          },
          _sum: {
            filledQuantity: true,
            averagePrice: true,
          },
        })

        const totalVolume = (orders._sum.filledQuantity || 0) * (orders._sum.averagePrice || 0)

        return {
          id: user.id,
          clerkId: user.clerkId,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
          email: user.email,
          phone: user.phone,
          kycStatus: user.kycStatus,
          accountStatus: user.accountStatus,
          balance: user.balance.toNumber(),
          joinedDate: user.createdAt,
          lastActive: user.lastLoginAt,
          totalOrders: user._count.orders,
          totalVolume,
        }
      })
    )

    return NextResponse.json({
      users: usersWithVolume,
      total: usersWithVolume.length,
    })
  } catch (error) {
    console.error('Admin users fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    })

    if (adminUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { targetUserId, action } = await request.json()

    if (!targetUserId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    let updateData: any = {}

    switch (action) {
      case 'SUSPEND':
        updateData = { accountStatus: 'SUSPENDED' }
        break
      case 'ACTIVATE':
        updateData = { accountStatus: 'ACTIVE' }
        break
      case 'DEACTIVATE':
        updateData = { accountStatus: 'INACTIVE' }
        break
      case 'VERIFY_KYC':
        updateData = { kycStatus: 'VERIFIED' }
        break
      case 'REJECT_KYC':
        updateData = { kycStatus: 'REJECTED' }
        break
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: updateData,
    })

    return NextResponse.json({
      message: 'User updated successfully',
      user: updatedUser,
    })
  } catch (error) {
    console.error('Admin user update error:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}
