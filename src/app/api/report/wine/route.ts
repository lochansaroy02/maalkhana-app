import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {

    try {



        const [
            // totalCash, // crate  the cash logic to count the cash in the field 

        ] = await Promise.all([
            // prisma.seizedVehicle.count({
            //     where: { caseProperty: type }
            // }),

        ]);


        return NextResponse.json({


        });
    } catch (error) {
        console.error('Error fetching total entries:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch entries' },
            { status: 500 },
        );
    }
};
