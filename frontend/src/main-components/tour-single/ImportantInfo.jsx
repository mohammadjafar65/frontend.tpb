const ImportantInfo = ({ tour }) => {
  const parseArray = (value) => {
    try {
      if (Array.isArray(value)) return value;

      const parsed = JSON.parse(value);

      // Sometimes values come as stringified strings: "[\"value1\",\"value2\"]"
      if (typeof parsed === "string") {
        return JSON.parse(parsed);
      }

      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const inclusions = parseArray(tour?.inclusions);
  const exclusions = parseArray(tour?.exclusions);
  const additionalInfo = parseArray(tour?.additionalInformation);

  return (
    <div className="row x-gap-40 y-gap-40 justify-between pt-20 text-left">
      <div className="col-lg-6 col-md-6">
        <div className="fw-500 mb-10">Inclusions</div>
        <ul className="list-disc">
          {inclusions.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>

      {/* <div className="col-lg-4 col-md-6">
        <div className="fw-500 mb-10">Departure details</div>
        <div className="text-15">
          Departures from 01st April 2022: Tour departs at 8 am (boarding at
          7.30 am), Victoria Coach Station Gate 1-5
        </div>
      </div>

      <div className="col-lg-3 col-md-6">
        <div className="fw-500 mb-10">Know before you go</div>
        <ul className="list-disc">
          <li>Duration: 11h</li>
          <li>Mobile tickets accepted</li>
          <li>Instant confirmation</li>
        </ul>
      </div> */}

      <div className="col-lg-6 col-md-6">
        <div className="fw-500 mb-10">Exclusions</div>
        <ul className="list-disc">
          {exclusions.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="col-12">
        <div className="fw-500 mb-10">Additional information</div>
        <ul className="list-disc">
          {additionalInfo.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ImportantInfo;
