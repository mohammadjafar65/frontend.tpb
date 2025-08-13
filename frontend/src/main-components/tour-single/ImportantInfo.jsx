const ImportantInfo = ({ tour }) => {
  const parseArray = (value) => {
    try {
      if (Array.isArray(value)) return value;
      const parsed = JSON.parse(value);
      if (typeof parsed === "string") return JSON.parse(parsed);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const isMeaningfulHTML = (html) =>
    typeof html === "string" &&
    html.trim() !== "" &&
    html.trim() !== "<p><br></p>";

  const inclusions = parseArray(tour?.included);
  const exclusions = parseArray(tour?.excluded);
  const additionalInfo = parseArray(tour?.additionalInformation);

  const {
    specialInstructions,
    conditionsOfTravel,
    thingsToMaintain,
    policies,
    terms,
  } = tour || {};

  const hasContent =
    inclusions.length > 0 ||
    exclusions.length > 0 ||
    additionalInfo.length > 0 ||
    isMeaningfulHTML(specialInstructions) ||
    isMeaningfulHTML(conditionsOfTravel) ||
    isMeaningfulHTML(thingsToMaintain) ||
    isMeaningfulHTML(policies) ||
    isMeaningfulHTML(terms);

  if (!hasContent) return null;

  return (
    <section className="pt-40 pb-40 bg-white">
      <div className="container">
        <div className="pt-40 border-top-light">
          <div className="row x-gap-40 y-gap-40">
            <div className="col-auto">
              <h3 className="text-22 fw-500">Additional Information</h3>
            </div>
          </div>

          <div className="row x-gap-40 y-gap-40 justify-between pt-20 text-left">
            {isMeaningfulHTML(specialInstructions) && (
              <div className="col-12">
                <div className="fw-600 mb-10">Special Instructions</div>
                <div
                  className="text-15"
                  dangerouslySetInnerHTML={{ __html: specialInstructions }}
                />
              </div>
            )}

            {isMeaningfulHTML(conditionsOfTravel) && (
              <div className="col-12">
                <div className="fw-600 mb-10">Conditions of Travel</div>
                <div
                  className="text-15"
                  dangerouslySetInnerHTML={{ __html: conditionsOfTravel }}
                />
              </div>
            )}

            {isMeaningfulHTML(thingsToMaintain) && (
              <div className="col-12">
                <div className="fw-600 mb-10">Things to Maintain</div>
                <div
                  className="text-15"
                  dangerouslySetInnerHTML={{ __html: thingsToMaintain }}
                />
              </div>
            )}

            {isMeaningfulHTML(policies) && (
              <div className="col-12">
                <div className="fw-600 mb-10">Policies</div>
                <div
                  className="text-15"
                  dangerouslySetInnerHTML={{ __html: policies }}
                />
              </div>
            )}

            {isMeaningfulHTML(terms) && (
              <div className="col-12">
                <div className="fw-600 mb-10">Terms & Conditions</div>
                <div
                  className="text-15"
                  dangerouslySetInnerHTML={{ __html: terms }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImportantInfo;
