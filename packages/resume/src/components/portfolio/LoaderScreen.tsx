export default function LoaderScreen() {
  return (
    <div className="loader-screen" id="loader" aria-hidden="true">
      <div className="loader-content">
        <div className="loader-code-text">
          <div className="code-line" data-line="1">
            const developer = {"{"}
          </div>
          <div className="code-line" data-line="2">
            name: 'Bian',
          </div>
          <div className="code-line" data-line="3">
            message: 'contact to me'
          </div>
          <div className="code-line" data-line="4">
            {"};"}
          </div>
        </div>

        <div className="loader-spinner-wrapper">
          <div className="loader-spinner" />
        </div>

        <div className="loader-progress-wrapper">
          <div className="loader-progress-bar" />
        </div>

        <div className="loader-percentage" id="loaderPercent">
          0%
        </div>
      </div>
    </div>
  );
}
