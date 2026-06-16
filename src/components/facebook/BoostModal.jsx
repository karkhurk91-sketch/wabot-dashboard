import React, { useState, useEffect } from 'react';
import { facebookApi } from '../../services/facebook/api';
import PostPreview from '../../components/facebook/PostPreview';  // Import your preview component

export default function BoostModal({ post, onClose, onBoostCreated }) {
  // Step tracking
  const [step, setStep] = useState(1);

  // Goal selection
  const [goal, setGoal] = useState('automatic');
  const goalOptions = [
    { value: 'automatic', label: 'Automatic (Recommended)' },
    { value: 'messages', label: 'Get more messages' },
    { value: 'video_views', label: 'Get more video views' },
    { value: 'leads', label: 'Get more leads' },
    { value: 'calls', label: 'Get more calls' },
    { value: 'engagement', label: 'Get more engagement' },
  ];

  // Audience targeting
  const [audienceType, setAudienceType] = useState('recommended');
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(65);
  const [gender, setGender] = useState('all');
  const [location, setLocation] = useState('');
  const [interests, setInterests] = useState([]);
  const [interestInput, setInterestInput] = useState('');
  const [useAdvantageAudience, setUseAdvantageAudience] = useState(false);

  // Budget & Schedule
  const [dailyBudget, setDailyBudget] = useState(500);
  const [durationDays, setDurationDays] = useState(7);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [runContinuously, setRunContinuously] = useState(false);

  // Ad details
  const [ctaType, setCtaType] = useState('none');
  const ctaOptions = [
    { value: 'none', label: 'No button' },
    { value: 'LEARN_MORE', label: 'Learn More' },
    { value: 'SIGN_UP', label: 'Sign Up' },
    { value: 'CONTACT_US', label: 'Contact Us' },
    { value: 'SHOP_NOW', label: 'Shop Now' },
    { value: 'BOOK_NOW', label: 'Book Now' },
    { value: 'GET_OFFER', label: 'Get Offer' },
    { value: 'WATCH_MORE', label: 'Watch More' },
  ];
  const [useAdvantageCreative, setUseAdvantageCreative] = useState(true);
  const [specialAdCategory, setSpecialAdCategory] = useState('none');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [eligibility, setEligibility] = useState({ eligible: true, reason: '' });
  const [checkingEligibility, setCheckingEligibility] = useState(true);

  // Set default start date/time
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    setStartDate(tomorrow.toISOString().split('T')[0]);
    setStartTime('09:00');
  }, []);

  // Check post eligibility when modal opens
  useEffect(() => {
    const checkEligibility = async () => {
      setCheckingEligibility(true);
      try {
        const res = await facebookApi.checkPostEligibility(post.id);
        setEligibility(res.data);
      } catch (err) {
        setEligibility({ eligible: false, reason: 'Unable to check eligibility. Please try again.' });
      } finally {
        setCheckingEligibility(false);
      }
    };
    if (post && post.id) {
      checkEligibility();
    }
  }, [post]);

  const addInterest = () => {
    if (interestInput.trim() && !interests.includes(interestInput.trim())) {
      setInterests([...interests, interestInput.trim()]);
      setInterestInput('');
    }
  };

  const removeInterest = (interest) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const handleSubmit = async () => {
    if (!eligibility.eligible) {
      setError('This post is not eligible for boosting. ' + eligibility.reason);
      return;
    }
    setLoading(true);
    setError(null);

    // Build targeting object
    const targeting = {
      geo_locations: location ? { cities: [{ name: location }] } : { countries: ['IN'] },
      age_min: ageMin,
      age_max: ageMax,
    };

    if (gender !== 'all') {
      targeting.genders = gender === 'male' ? [1] : [2];
    }

    if (interests.length > 0) {
      targeting.interests = interests.map(name => ({ name }));
    }

    try {
      const payload = {
        daily_budget: dailyBudget,
        duration_days: durationDays,
        targeting: targeting,
        goal: goal,
        cta: ctaType !== 'none' ? ctaType : undefined,
        start_date: startDate,
        start_time: startTime,
        run_continuously: runContinuously,
        advantage_audience: useAdvantageAudience,
        advantage_creative: useAdvantageCreative,
        special_ad_category: specialAdCategory !== 'none' ? specialAdCategory : undefined,
      };

      const res = await facebookApi.boostPost(post.id, payload);
      if (onBoostCreated) onBoostCreated(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create boost campaign');
    } finally {
      setLoading(false);
    }
  };

  // Render different steps
  const renderGoalStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Choose Your Goal</h3>
      <p className="text-sm text-gray-500">Select what you want your boosted post to achieve.</p>
      <div className="space-y-2">
        {goalOptions.map(option => (
          <label key={option.value} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="radio"
              name="goal"
              value={option.value}
              checked={goal === option.value}
              onChange={() => setGoal(option.value)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm">{option.label}</span>
          </label>
        ))}
      </div>
      <div className="flex justify-end">
        <button onClick={() => setStep(2)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Next: Audience →
        </button>
      </div>
    </div>
  );

  const renderAudienceStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Build Your Audience</h3>
      <p className="text-sm text-gray-500">Define who should see your boosted post.</p>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Audience Type</label>
        <select
          value={audienceType}
          onChange={(e) => setAudienceType(e.target.value)}
          className="w-full border rounded-lg p-2"
        >
          <option value="recommended">Recommended Audience</option>
          <option value="custom">Custom Audience</option>
        </select>
      </div>

      {audienceType === 'custom' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age Range</label>
              <div className="flex gap-2">
                <input type="number" value={ageMin} onChange={(e) => setAgeMin(parseInt(e.target.value))} className="w-1/2 border rounded-lg p-2" min="13" max="100" />
                <input type="number" value={ageMax} onChange={(e) => setAgeMax(parseInt(e.target.value))} className="w-1/2 border rounded-lg p-2" min="13" max="100" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full border rounded-lg p-2">
                <option value="all">All</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Mumbai, India"
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interests</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                placeholder="e.g., Business, Fitness"
                className="flex-1 border rounded-lg p-2"
                onKeyPress={(e) => e.key === 'Enter' && addInterest()}
              />
              <button onClick={addInterest} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Add</button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {interests.map(interest => (
                <span key={interest} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  {interest}
                  <button onClick={() => removeInterest(interest)} className="text-blue-500 hover:text-blue-700">&times;</button>
                </span>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={useAdvantageAudience}
          onChange={() => setUseAdvantageAudience(!useAdvantageAudience)}
          className="w-4 h-4 text-blue-600"
        />
        <span className="text-sm">Use Advantage+ audience (Meta optimizes targeting automatically)</span>
      </div>

      <div className="flex justify-between">
        <button onClick={() => setStep(1)} className="px-6 py-2 border rounded-lg hover:bg-gray-50">← Back</button>
        <button onClick={() => setStep(3)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Next: Budget →
        </button>
      </div>
    </div>
  );

  const renderBudgetStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Set Budget & Schedule</h3>
      <p className="text-sm text-gray-500">Define how much to spend and when to run your boost.</p>

      {/* Post preview */}
      <div className="mb-3">
        <p className="text-sm font-medium text-gray-700 mb-1">Post being boosted</p>
        <PostPreview
          title={post.title}
          content={post.content}
          hashtags={post.hashtags}
          mediaUrl={post.media_url}
          mediaType={post.media_type}
          pageName={post.page_name}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Daily Budget (₹)</label>
        <input
          type="number"
          value={dailyBudget}
          onChange={(e) => setDailyBudget(parseInt(e.target.value) || 0)}
          className="w-full border rounded-lg p-2"
          min="100"
          step="50"
        />
        <p className="text-xs text-gray-400 mt-1">Minimum ₹100 per day</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
        <div className="flex gap-3">
          <input
            type="number"
            value={durationDays}
            onChange={(e) => setDurationDays(parseInt(e.target.value) || 1)}
            className="w-24 border rounded-lg p-2"
            min="1"
            max="30"
          />
          <span className="text-sm text-gray-600 self-center">days</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">Minimum 1 day, recommended at least 7 days for optimal performance</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time</label>
        <div className="flex gap-3">
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="flex-1 border rounded-lg p-2" />
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-32 border rounded-lg p-2" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={runContinuously}
          onChange={() => setRunContinuously(!runContinuously)}
          className="w-4 h-4 text-blue-600"
        />
        <span className="text-sm">Run continuously until manually paused</span>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Call-to-Action</label>
        <select value={ctaType} onChange={(e) => setCtaType(e.target.value)} className="w-full border rounded-lg p-2">
          {ctaOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Special Ad Category</label>
        <select value={specialAdCategory} onChange={(e) => setSpecialAdCategory(e.target.value)} className="w-full border rounded-lg p-2">
          <option value="none">None</option>
          <option value="credit">Credit</option>
          <option value="employment">Employment</option>
          <option value="housing">Housing</option>
          <option value="social_issues">Social Issues, Elections, Politics</option>
        </select>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={useAdvantageCreative}
          onChange={() => setUseAdvantageCreative(!useAdvantageCreative)}
          className="w-4 h-4 text-blue-600"
        />
        <span className="text-sm">Use Advantage+ creative (auto-optimize creative variations)</span>
      </div>

      <div className="flex justify-between">
        <button onClick={() => setStep(2)} className="px-6 py-2 border rounded-lg hover:bg-gray-50">← Back</button>
        <button
          onClick={handleSubmit}
          disabled={loading || !eligibility.eligible}
          className={`px-6 py-2 rounded-lg text-white transition ${!eligibility.eligible ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {loading ? 'Creating...' : 'Boost Post'}
        </button>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">{error}</div>}
      {!eligibility.eligible && !error && (
        <div className="p-3 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200">
          ⚠️ {eligibility.reason || 'This post is not eligible for boosting.'}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-4 mb-4">
            <h2 className="text-xl font-bold">Boost Post</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>
          </div>

          {/* Eligibility loading banner */}
          {checkingEligibility && (
            <div className="mb-4 p-2 bg-blue-50 text-blue-600 rounded-lg text-sm">
              Checking post eligibility...
            </div>
          )}

          {/* Step indicator */}
          <div className="flex justify-between mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step === s ? 'bg-blue-600 text-white' :
                  step > s ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > s ? '✓' : s}
                </div>
                <span className={`text-xs ml-2 ${step === s ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                  {s === 1 ? 'Goal' : s === 2 ? 'Audience' : 'Budget'}
                </span>
              </div>
            ))}
          </div>

          {/* Step content */}
          {step === 1 && renderGoalStep()}
          {step === 2 && renderAudienceStep()}
          {step === 3 && renderBudgetStep()}
        </div>
      </div>
    </div>
  );
}