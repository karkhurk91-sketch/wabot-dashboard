import React, { useState } from 'react';

export default function PostPreview({ title, content, hashtags, media = [], pageName = 'Your Page', privacy = 'Public', feeling = null, location = null, cta = null, linkPreview = null, abTest = null }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const renderCTABadge = () => {
    if (!cta) return null;
    const labels = { whatsapp: <><i className="fab fa-whatsapp mr-1"></i> WhatsApp</>, messenger: <><i className="fab fa-facebook-messenger mr-1"></i> Send Message</>, call: <><i className="fas fa-phone-alt mr-1"></i> Call</> };
    return <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">{labels[cta.type]}</span>;
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 max-w-md mx-auto">
      <div className="p-4 border-b border-gray-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">{pageName.charAt(0)}</div>
        <div><p className="font-semibold text-gray-800">{pageName}</p><p className="text-xs text-gray-500">Just now · {privacy === 'public' ? '🌍 Public' : '🔒 Restricted'}</p></div>
      </div>
      {media && media.length > 0 && (
        <div className="relative">
          <div className="overflow-hidden"><div className="flex transition-transform duration-300" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {media.map((item, idx) => (
              <div key={idx} className="min-w-full">
                {item.type === 'video' ? <video src={item.url} controls className="w-full max-h-64 object-cover" /> : <img src={item.url} alt={`Slide ${idx}`} className="w-full max-h-64 object-cover" />}
              </div>
            ))}
          </div></div>
          {media.length > 1 && (
            <>
              <button onClick={() => setCurrentSlide(prev => prev > 0 ? prev - 1 : media.length - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow hover:bg-white"><i className="fas fa-chevron-left"></i></button>
              <button onClick={() => setCurrentSlide(prev => prev < media.length - 1 ? prev + 1 : 0)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow hover:bg-white"><i className="fas fa-chevron-right"></i></button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">{media.map((_, idx) => <div key={idx} className={`w-2 h-2 rounded-full ${idx === currentSlide ? 'bg-blue-600' : 'bg-gray-300'}`} />)}</div>
            </>
          )}
        </div>
      )}
      <div className="p-4">
        {title && <h3 className="font-bold text-lg mb-1">{title}</h3>}
        <p className="text-gray-700 whitespace-pre-wrap">{content}</p>
        {feeling && <p className="text-sm text-gray-500 mt-2"><i className="far fa-smile text-yellow-500 mr-1"></i> Feeling {feeling.emoji} {feeling.name}</p>}
        {location && <p className="text-sm text-gray-500 mt-1"><i className="fas fa-map-marker-alt text-red-500 mr-1"></i> {location}</p>}
        {hashtags && <p className="text-blue-600 text-sm mt-2">{hashtags}</p>}
        {cta && <div className="mt-2">{renderCTABadge()}</div>}
        {linkPreview && (
          <div className="mt-3 border rounded-lg overflow-hidden">
            <img src={linkPreview.image} alt="Link preview" className="w-full h-32 object-cover" />
            <div className="p-3"><div className="font-semibold text-sm">{linkPreview.title}</div><div className="text-xs text-gray-500">{linkPreview.description}</div><div className="text-xs text-blue-600">{linkPreview.url}</div></div>
          </div>
        )}
        {abTest && <div className="mt-2 text-xs text-purple-600"><i className="fas fa-chart-line mr-1"></i> A/B Test ({abTest.variants.length} variants, {abTest.duration} days)</div>}
      </div>
      <div className="flex border-t border-gray-100">
        <button className="flex-1 py-2 text-gray-600 hover:bg-gray-50 rounded text-sm"><i className="far fa-thumbs-up mr-1"></i> Like</button>
        <button className="flex-1 py-2 text-gray-600 hover:bg-gray-50 rounded text-sm"><i className="far fa-comment mr-1"></i> Comment</button>
        <button className="flex-1 py-2 text-gray-600 hover:bg-gray-50 rounded text-sm"><i className="far fa-share-square mr-1"></i> Share</button>
      </div>
    </div>
  );
}