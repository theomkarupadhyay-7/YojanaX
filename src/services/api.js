const BASE_URL = 'http://localhost:8000';

export async function checkEligibility(payload) {
  try {
    const response = await fetch(`${BASE_URL}/eligibility/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Failed to check eligibility: ${error.message}`);
  }
}
