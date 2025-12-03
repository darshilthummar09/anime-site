import { NextRequest, NextResponse } from 'next/server';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Update user premium status in Firestore
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, isPremium } = body;

    if (!uid || typeof isPremium !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request. uid and isPremium (boolean) are required.' },
        { status: 400 }
      );
    }

    // Update user document
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, {
      isPremium,
      premiumUpdatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Premium status updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating premium status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update premium status' },
      { status: 500 }
    );
  }
}

// Get user premium status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json(
        { error: 'User ID (uid) is required' },
        { status: 400 }
      );
    }

    const userDocRef = doc(db, 'users', uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDocSnap.data();
    return NextResponse.json({
      isPremium: userData.isPremium || false,
      premiumUpdatedAt: userData.premiumUpdatedAt || null,
    });
  } catch (error: any) {
    console.error('Error getting premium status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get premium status' },
      { status: 500 }
    );
  }
}

