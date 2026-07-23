import { EdgeSandbox } from '../src/services/sandbox';

async function main() {
  const code = `
    const payload = requestPayload;
    if (payload.action === 'multiply') {
      payload.a * payload.b;
    } else {
      "Unknown action";
    }
  `;

  console.log('Executing Edge Sandbox...');
  try {
    const result = await EdgeSandbox.execute(code, {
      requestPayload: { action: 'multiply', a: 10, b: 42 }
    });
    console.log('Result:', result);
  } catch (err) {
    console.error(err);
  }
}

main();
