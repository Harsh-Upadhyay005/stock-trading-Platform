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
    const segment = searchParams.get('segment')
    const exchange = searchParams.get('exchange')
    const search = searchParams.get('search')
    const tradable = searchParams.get('tradable')

    // Build query filters
    const where: any = {}
    
    if (segment) {
      where.segment = segment
    }
    
    if (exchange) {
      where.exchange = exchange
    }
    
    if (tradable) {
      where.tradable = tradable === 'true'
    }
    
    if (search) {
      where.OR = [
        { symbol: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { isin: { contains: search, mode: 'insensitive' } },
      ]
    }

    const instruments = await prisma.instrument.findMany({
      where,
      select: {
        id: true,
        symbol: true,
        name: true,
        exchange: true,
        segment: true,
        isin: true,
        lotSize: true,
        tickSize: true,
        tradable: true,
        updatedAt: true,
      },
      orderBy: {
        symbol: 'asc',
      },
    })

    return NextResponse.json({
      instruments: instruments.map(i => ({
        ...i,
        lotSize: i.lotSize,
        tickSize: i.tickSize.toNumber(),
      })),
      total: instruments.length,
    })
  } catch (error) {
    console.error('Admin instruments fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch instruments' },
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

    const { instrumentId, action } = await request.json()

    if (!instrumentId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    let updateData: any = {}

    switch (action) {
      case 'ENABLE_TRADING':
        updateData = { tradable: true }
        break
      case 'DISABLE_TRADING':
        updateData = { tradable: false }
        break
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    const updatedInstrument = await prisma.instrument.update({
      where: { id: instrumentId },
      data: updateData,
    })

    return NextResponse.json({
      message: 'Instrument updated successfully',
      instrument: updatedInstrument,
    })
  } catch (error) {
    console.error('Admin instrument update error:', error)
    return NextResponse.json(
      { error: 'Failed to update instrument' },
      { status: 500 }
    )
  }
}
