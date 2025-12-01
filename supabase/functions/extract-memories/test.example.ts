/**
 * Example test cases for the extract-memories Edge Function
 *
 * These can be used to validate the extraction logic locally
 * before deploying to production.
 */

interface TestCase {
  name: string;
  message: string;
  context: string;
  expectedExtractions: {
    type: string;
    category: string;
    contentPattern: RegExp;
    minConfidence: number;
  }[];
  shouldSkip?: boolean;
}

const TEST_CASES: TestCase[] = [
  {
    name: "Price sensitivity - explicit budget concern",
    message: "make sure it's not too expensive, I'm on a tight budget",
    context: "user: I want to plan a golf trip\nassistant: Great! Where would you like to go?",
    expectedExtractions: [
      {
        type: "preference",
        category: "budget",
        contentPattern: /price-sensitive|budget-conscious/i,
        minConfidence: 0.8,
      },
    ],
  },
  {
    name: "Time preference - morning person",
    message: "I hate waking up early, can we do afternoon tee times?",
    context: "user: Looking for courses\nassistant: What time do you prefer?",
    expectedExtractions: [
      {
        type: "preference",
        category: "logistics",
        contentPattern: /afternoon|late|not.*early/i,
        minConfidence: 0.85,
      },
    ],
  },
  {
    name: "Health constraint - physical limitation",
    message: "my knee has been bothering me lately, so I'll need a cart",
    context: "user: Planning a trip\nassistant: Any special requirements?",
    expectedExtractions: [
      {
        type: "constraint",
        category: "health",
        contentPattern: /knee|cart|physical/i,
        minConfidence: 0.75,
      },
    ],
  },
  {
    name: "Play style - competitive nature",
    message: "I take my game seriously, not looking for a casual round",
    context: "user: Show me courses\nassistant: What kind of experience?",
    expectedExtractions: [
      {
        type: "preference",
        category: "play_style",
        contentPattern: /competitive|serious|not casual/i,
        minConfidence: 0.8,
      },
    ],
  },
  {
    name: "Social preference - group dynamics",
    message: "It's just me and my wife, we like quiet rounds",
    context: "user: Golf trip\nassistant: How many golfers?",
    expectedExtractions: [
      {
        type: "preference",
        category: "social",
        contentPattern: /quiet|peaceful|couple/i,
        minConfidence: 0.7,
      },
    ],
  },
  {
    name: "Too short - should skip",
    message: "ok",
    context: "assistant: Does that work?",
    expectedExtractions: [],
    shouldSkip: true,
  },
  {
    name: "Explicit booking data - should NOT extract",
    message: "I want to book March 15-20 for 4 golfers",
    context: "user: Planning a trip\nassistant: Great!",
    expectedExtractions: [],
    shouldSkip: false, // Won't skip due to length, but should extract nothing
  },
  {
    name: "Luxury preference - subtle signal",
    message: "I don't mind spending more for top-tier courses",
    context: "user: Budget?\nassistant: What's your budget like?",
    expectedExtractions: [
      {
        type: "preference",
        category: "budget",
        contentPattern: /luxury|premium|willing.*spend/i,
        minConfidence: 0.75,
      },
    ],
  },
  {
    name: "Walking preference - play style",
    message: "I prefer to walk the course if possible, it's part of the experience",
    context: "user: Course preferences?\nassistant: Tell me more",
    expectedExtractions: [
      {
        type: "preference",
        category: "play_style",
        contentPattern: /walk|walking/i,
        minConfidence: 0.85,
      },
    ],
  },
  {
    name: "Location preference - logistics",
    message: "I'd rather stay near the beach area, hate being inland",
    context: "user: Region preference?\nassistant: Where would you like to stay?",
    expectedExtractions: [
      {
        type: "preference",
        category: "logistics",
        contentPattern: /beach|coastal|location/i,
        minConfidence: 0.75,
      },
    ],
  },
];

/**
 * Run test cases against the extraction function
 *
 * Usage:
 * 1. Deploy function locally: supabase functions serve extract-memories
 * 2. Run tests: deno run --allow-net test.example.ts
 */
async function runTests() {
  const BASE_URL = 'http://localhost:54321/functions/v1/extract-memories';
  const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

  console.log('Running extraction tests...\n');

  let passed = 0;
  let failed = 0;

  for (const testCase of TEST_CASES) {
    console.log(`Test: ${testCase.name}`);

    try {
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message_id: crypto.randomUUID(),
          session_uuid: crypto.randomUUID(),
          user_id: null,
          content: testCase.message,
          context: testCase.context,
        }),
      });

      const result = await response.json();

      if (testCase.shouldSkip) {
        if (result.reason === 'rate_limited_or_too_short') {
          console.log('✓ Correctly skipped\n');
          passed++;
        } else {
          console.log('✗ Should have been skipped\n');
          failed++;
        }
        continue;
      }

      if (testCase.expectedExtractions.length === 0) {
        if (result.extracted === 0) {
          console.log('✓ Correctly extracted nothing\n');
          passed++;
        } else {
          console.log('✗ Should not have extracted anything\n');
          console.log('Results:', JSON.stringify(result, null, 2));
          failed++;
        }
        continue;
      }

      // Validate extractions
      let testPassed = true;
      for (const expected of testCase.expectedExtractions) {
        const found = result.results?.some((r: any) =>
          r.category === expected.category &&
          r.confidence >= expected.minConfidence
        );

        if (!found) {
          console.log(`✗ Missing expected extraction: ${expected.category}`);
          console.log('Results:', JSON.stringify(result, null, 2));
          testPassed = false;
        }
      }

      if (testPassed) {
        console.log('✓ Passed\n');
        passed++;
      } else {
        failed++;
      }

    } catch (error) {
      console.log('✗ Error:', error.message, '\n');
      failed++;
    }
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
}

// Uncomment to run:
// runTests();

export { TEST_CASES };
