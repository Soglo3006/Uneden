"use client";

interface Faq {
  question: string;
  answer: string;
}

interface Props {
  faqs: Faq[];
}

export default function ServiceFaqReviews({ faqs }: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 shadow-sm p-6">
      {faqs.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">FAQ</h2>
          <div className="space-y-3">
            {faqs.map((f, idx) => (
              <div key={idx} className="border border-gray-100 rounded-lg p-4">
                <div className="font-semibold text-gray-900 mb-1">{f.question}</div>
                <p className="text-gray-700 text-sm leading-relaxed">{f.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Reviews</h2>
      <p className="text-gray-500 text-sm">No reviews yet for this service.</p>
    </div>
  );
}
