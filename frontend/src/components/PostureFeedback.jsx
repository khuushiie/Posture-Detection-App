import React from 'react';

function PostureFeedback({ feedback }) {
  if (!feedback || feedback.length === 0) {
    return <div className="text-gray-500">No posture feedback available</div>;
  }

  return (
    <div className="space-y-2">
      {feedback.map((item) => (
        <div key={item.frame} className="bg-white p-4 rounded shadow">
          <h3 className="font-bold text-lg text-blue-700">Frame {item.frame}</h3>
          <ul className="list-disc ml-5 mt-2">
            {item.issues?.length > 0 ? (
              <ul className="list-disc ml-5 mt-2">
                {item.issues.map((issue, index) => (
                  <li key={index} className="text-red-600">{issue.message}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No issues found in this frame.</p>
            )}

          </ul>
        </div>
      ))}
    </div>
  );
}

export default PostureFeedback;