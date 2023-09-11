import React, { useEffect, useState } from 'react';
import Alert from '../../../library/Alert/Alert';
import { useLocation, useHistory } from 'react-router';

export default function LoginAlert({
  open = false,
  handleClose = () => {},
}) {
  const location = useLocation();
  const history = useHistory();
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const search = new URLSearchParams(location.search);
    const showAlertFromQuery = search.get('showAlert');
    if (showAlertFromQuery === 'true') {
      setShowAlert(true);
      // Update showAlert query param to false
      search.set('showAlert', false);

      // Replace the current URL with the updated query params
      history.replace({
        search: search.toString(),
      });
    }
  }, []);

  return (
    <Alert
      open={showAlert}
      onClose={() => setShowAlert(false)}
      horizontalAlign="right"
      verticalAlign="top"
      timeout={2000}
    >
      Please Login to Access Ebooks
    </Alert>
  );
}