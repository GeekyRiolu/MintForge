describe('AI generator chat API', () => {
  it('streams a chat response with generated images', () => {
    cy.request({
      method: 'POST',
      url: '/api/chat',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        messages: [
          {
            id: 'user-1',
            role: 'user',
            parts: [
              {
                type: 'text',
                text: 'Create a fiery phoenix NFT with gold feathers',
              },
            ],
          },
        ],
        useFreepik: false,
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.headers['content-type']).to.include('text/event-stream');
      expect(response.body).to.include('"type":"data-generatedImages"');
      expect(response.body).to.include('data:image/');
      expect(response.body).to.include('Here are 3 AI-generated NFT designs');
    });
  });

  it('rejects chat requests without a user prompt', () => {
    cy.request({
      method: 'POST',
      url: '/api/chat',
      failOnStatusCode: false,
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        messages: [],
        useFreepik: false,
      },
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body).to.deep.eq({
        error: 'Prompt is required',
      });
    });
  });
});
