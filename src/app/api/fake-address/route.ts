import { NextRequest, NextResponse } from 'next/server';
import { allFakers, type Faker } from '@faker-js/faker';

// Define the response shape
interface AddressResponse {
  street: string;
  buildingNumber: string;
  city: string;
  zipCode: string;
  country: string;
  state: string;
  latitude: number;
  longitude: number;
  fullAddress: string;
  timeZone: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { locale = 'en' } = body as { locale: string };

    // specific locale or fallback to English
    const fakerInstance = (allFakers[locale as keyof typeof allFakers] || allFakers.en) as Faker;

    // Generate address data using the new 'location' module (v8+)
    const data: AddressResponse = {
      street: fakerInstance.location.streetAddress(),
      buildingNumber: fakerInstance.location.buildingNumber(),
      city: fakerInstance.location.city(),
      zipCode: fakerInstance.location.zipCode(),
      country: fakerInstance.location.country(),
      state: fakerInstance.location.state(),
      latitude: fakerInstance.location.latitude(),
      longitude: fakerInstance.location.longitude(),
      fullAddress: fakerInstance.location.streetAddress({ useFullAddress: true }),
      timeZone: fakerInstance.location.timeZone(),
    };

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to generate address', details: errorMessage }, 
      { status: 500 }
    );
  }
}
