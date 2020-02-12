import React, { memo } from "react"
import "../styles.css"

const CloudDownload = ({ className }) => (
  <svg
    aria-hidden="true"
    focusable="false"
    data-prefix="fad"
    data-icon="cloud-download-alt"
    role="img"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 640 512"
    className={className}
  >
    <g class="fa-group">
      <path
        fill="#ecf0f1"
        d="M537.6 226.6A96.11 96.11 0 0 0 448 96a95.51 95.51 0 0 0-53.3 16.2A160 160 0 0 0 96 192c0 2.7.1 5.4.2 8.1A144 144 0 0 0 144 480h368a128 128 0 0 0 25.6-253.4zm-132.9 88.7L299.3 420.7a16.06 16.06 0 0 1-22.6 0L171.3 315.3c-10.1-10.1-2.9-27.3 11.3-27.3H248V176a16 16 0 0 1 16-16h48a16 16 0 0 1 16 16v112h65.4c14.2 0 21.4 17.2 11.3 27.3z"
        class="fa-secondary"
      ></path>
      <path
        fill="transparent"
        d="M404.7 315.3L299.3 420.7a16.06 16.06 0 0 1-22.6 0L171.3 315.3c-10.1-10.1-2.9-27.3 11.3-27.3H248V176a16 16 0 0 1 16-16h48a16 16 0 0 1 16 16v112h65.4c14.2 0 21.4 17.2 11.3 27.3z"
        class="fa-primary"
      ></path>
    </g>
  </svg>
)

CloudDownload.defaultProps = {
  className: "DefaultSvgClass"
}

export default memo(CloudDownload)