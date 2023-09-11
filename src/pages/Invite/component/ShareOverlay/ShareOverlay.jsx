import React from 'react'
import styles from './ShareOverlay.module.scss'
import Modal from 'react-modal'
import CloseIcon from '../../../../assets/Close.jsx'
import ClipboardIcon from '../../../../assets/clipboardSolid'
import {
    EmailShareButton,
    FacebookShareButton,
    LinkedinShareButton,
    TwitterShareButton,
    WhatsappShareButton,
    EmailIcon,
    FacebookIcon,
    LinkedinIcon,
    TwitterIcon,
    WhatsappIcon
} from 'react-share';
import { getToasterBasedOnType } from '../../../../components/Toaster'
import isMobile from '../../../../utils/isMobile'
import copyToClipboard from '../../../../utils/copyToClipboard'

const ShareOverlay = ({ visible, closeOverlay, shareUrl = '', title = '' }) => {
    return (
        <Modal
            isOpen={visible}
            className={styles.modalContainer}
            overlayClassName={styles.container}
            onRequestClose={() => closeOverlay()}
            closeTimeoutMS={500}
        >
            <div className={styles.pqStory}>
                Share Now!
            </div>
            <div
                onClick={() => closeOverlay()}
                className={styles.ShareOverlayClose}
            >
                <div className={styles.shareOverlayCloseIcon}>
                    <CloseIcon />
                </div>
            </div>
            <FacebookShareButton
                url={shareUrl}
                quote={title}
                className={styles.react_share_shareButton}
            >
                <div className={styles.shareButtonContainer}>
                    <div className={styles.shareButtonIcon}><FacebookIcon size={40} round={true} /></div>
                    <div className={styles.shareButtonName}>Share on Facebook</div>
                </div>
            </FacebookShareButton>

            <EmailShareButton
                subject={'This is from Tekie'}
                url={shareUrl}
                body={title}
                className={styles.react_share_shareButton}
            >
                <div className={styles.shareButtonContainer}>
                    <div className={styles.shareButtonIcon}><EmailIcon size={40} round={true} /></div>
                    <div className={styles.shareButtonName}>Share via Email</div>
                </div>
            </EmailShareButton>

            <LinkedinShareButton
                summary={'This is from Tekie'}
                url={shareUrl}
                source={shareUrl}
                title={title}
                className={styles.react_share_shareButton}
            >
                <div className={styles.shareButtonContainer}>
                    <div className={styles.shareButtonIcon}><LinkedinIcon size={40} round={true} /></div>
                    <div className={styles.shareButtonName}>Share on LinkedIn</div>
                </div>
            </LinkedinShareButton>

            {/*<PinterestShareButton
          url={shareUrl}
          description={title}
      >
          <div className={styles.shareButtonContainer}>
              <div className={styles.shareButtonIcon}><PinterestIcon size={40} round={true} /></div>
              <div className={styles.shareButtonName}>Pinterest</div>
          </div>
      </PinterestShareButton>

      <RedditShareButton
          url={shareUrl}
          title={title}
      >
          <div className={styles.shareButtonContainer}>
              <div className={styles.shareButtonIcon}><RedditIcon size={40} round={true} /></div>
              <div className={styles.shareButtonName}>Reddit</div>
          </div>
      </RedditShareButton>

      <TelegramShareButton
          url={shareUrl}
          title={title}
      >
          <div className={styles.shareButtonContainer}>
              <div className={styles.shareButtonIcon}><TelegramIcon size={40} round={true} /></div>
              <div className={styles.shareButtonName}>Telegram</div>
          </div>
      </TelegramShareButton>

      <TumblrShareButton
          url={shareUrl}
          title={title}
          caption={'This is shared from Tekie'}
      >
          <div className={styles.shareButtonContainer}>
              <div className={styles.shareButtonIcon}><TumblrIcon size={40} round={true} /></div>
              <div className={styles.shareButtonName}>Tumblr</div>
          </div>
      </TumblrShareButton>*/}

            <TwitterShareButton
                url={shareUrl}
                title={title}
                via={'Tekie'}
                className={styles.react_share_shareButton}
            >
                <div className={styles.shareButtonContainer}>
                    <div className={styles.shareButtonIcon}><TwitterIcon size={40} round={true} /></div>
                    <div className={styles.shareButtonName}>Share on Twitter</div>
                </div>
            </TwitterShareButton>

            <WhatsappShareButton
                url={shareUrl}
                title={title}
                className={styles.react_share_shareButton}
            >
                <div className={styles.shareButtonContainer}>
                    <div className={styles.shareButtonIcon}><WhatsappIcon size={40} round={true} /></div>
                    <div className={styles.shareButtonName}>Share on Whatsapp</div>
                </div>
            </WhatsappShareButton>
            <div
                className={styles.shareButtonContainer}
                style={{ marginTop: `${isMobile() ? '0.96618vw' : '6px'}`, cursor: 'pointer', width: `${isMobile() ? '90%' : ''}` }}
                onClick={() => {
                    copyToClipboard(shareUrl)
                    // if (navigator && navigator.clipboard) {
                    //     navigator.clipboard.writeText(shareUrl).then(() => {
                    //         getToasterBasedOnType({
                    //             type: "success",
                    //             message: "Copied To Clipboard"
                    //         });
                    //     })
                    // }
                }}
            >
                <div className={styles.shareButtonIcon}><ClipboardIcon /></div>
                <div className={styles.shareButtonName}>Copy to Clipboard</div>
            </div>

        </Modal>
    )
}

export default ShareOverlay
