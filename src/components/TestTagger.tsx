import { useState } from 'react';
import { componentTagger } from 'lovable-tagger';

export function TestTagger() {
  const [text, setText] = useState('');
  const [taggedText, setTaggedText] = useState('');

  const handleTag = () => {
    const result = componentTagger(text);
    setTaggedText(result);
  };

  return (
    <div className="p-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full p-2 border rounded"
        placeholder="Enter text to tag..."
      />
      <button
        onClick={handleTag}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Tag Text
      </button>
      <div className="mt-4">
        <h3 className="font-bold">Tagged Result:</h3>
        <pre className="mt-2 p-2 bg-gray-100 rounded">{JSON.stringify(taggedText, null, 2)}</pre>
      </div>
    </div>
  );
}
