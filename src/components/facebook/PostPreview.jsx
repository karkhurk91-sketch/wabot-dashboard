import React from 'react';

export default function PostPreview({
  title,
  content,
  hashtags,
  mediaUrl,
  mediaType,
  pageName = 'Your Facebook Page',
  privacy = 'Public',
  feeling = null,
  location = null,
  cta = null,
  linkPreview = null,
  abTest = null,
}) {
  const renderCTABadge = () => {
    if (!cta) return null;
    const labels = {
      whatsapp: (
        <>
          <i className="fab fa-whatsapp mr-1"></i> WhatsApp
        </>
      ),
      messenger: (
        <>
          <i className="fab fa-facebook-messenger mr-1"></i> Send Message
        </>
      ),
      call: (
        <>
          <i className="fas fa-phone-alt mr-1"></i> Call
        </>
      ),
    };
    return <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">{labels[cta.type]}</span>;
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 max-w-md mx-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
          {pageName.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-gray-800">{pageName}</p>
          <p className="text-xs text-gray-500">
            Just now · {privacy === 'public' ? '🌍 Public' : '🔒 Restricted'}
          </p>
        </div>
      </div>

      {/* Media */}
      {mediaUrl && (
        mediaType === 'video' ? (
          <video src={mediaUrl} controls className="w-full max-h-64 object-cover" />
        ) : (
          <img src={mediaUrl} alt="Post media" className="w-full max-h-64 object-cover" />
        )
      )}

      {/* Content */}
      <div className="p-4">
        {title && <h3 className="font-bold text-lg mb-1">{title}</h3>}
        <p className="text-gray-700 whitespace-pre-wrap">{content}</p>

        {/* Feeling */}
        {feeling && (
          <p className="text-sm text-gray-500 mt-2">
            <i className="far fa-smile text-yellow-500 mr-1"></i> Feeling {feeling.emoji} {feeling.name}
          </p>
        )}

        {/* Location */}
        {location && (
          <p className="text-sm text-gray-500 mt-1">
            <i className="fas fa-map-marker-alt text-red-500 mr-1"></i> {location}
          </p>
        )}

        {/* Hashtags */}
        {hashtags && <p className="text-blue-600 text-sm mt-2">{hashtags}</p>}

        {/* CTA */}
        {cta && <div className="mt-2">{renderCTABadge()}</div>}

        {/* Link Preview */}
        {linkPreview && (
          <div className="mt-3 border rounded-lg overflow-hidden">
            <img src={linkPreview.image} alt="Link preview" className="w-full h-32 object-cover" />
            <div className="p-3">
              <div className="font-semibold text-sm">{linkPreview.title}</div>
              <div className="text-xs text-gray-500">{linkPreview.description}</div>
              <div className="text-xs text-blue-600">{linkPreview.url}</div>
            </div>
          </div>
        )}

        {/* A/B Test indicator */}
        {abTest && (
          <div className="mt-2 text-xs text-purple-600">
            <i className="fas fa-chart-line mr-1"></i> A/B Test ({abTest.variants.length} variants, {abTest.duration} days)
          </div>
        )}
      </div>

      {/* Engagement actions */}
      <div className="flex border-t border-gray-100">
        <button className="flex-1 py-2 text-gray-600 hover:bg-gray-50 rounded text-sm">
          <i className="far fa-thumbs-up mr-1"></i> Like
        </button>
        <button className="flex-1 py-2 text-gray-600 hover:bg-gray-50 rounded text-sm">
          <i className="far fa-comment mr-1"></i> Comment
        </button>
        <button className="flex-1 py-2 text-gray-600 hover:bg-gray-50 rounded text-sm">
          <i className="far fa-share-square mr-1"></i> Share
        </button>
      </div>
    </div>
  );
}