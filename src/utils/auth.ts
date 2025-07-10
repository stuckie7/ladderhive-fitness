export const openOAuthPopup = (url: string, name: string = 'OAuthPopup', width = 500, height = 600) => {
  const left = (window.screen.width - width) / 2;
  const top = (window.screen.height - height) / 4;
  return window.open(
    url,
    name,
    `toolbar=no, location=no, directories=no, status=no, menubar=no, 
    scrollbars=no, resizable=no, copyhistory=no, 
    width=${width}, height=${height}, top=${top}, left=${left}`
  );
};

export const handleOAuthCallback = (
  popup: Window | null, 
  onSuccess: () => void, 
  onError: (error: Error) => void
) => {
  if (!popup) {
    onError(new Error('Popup window not available'));
    return;
  }

  const checkPopup = setInterval(() => {
    try {
      if (popup.closed) {
        clearInterval(checkPopup);
        onSuccess();
      }
    } catch (error) {
      clearInterval(checkPopup);
      onError(error as Error);
    }
  }, 1000);
};
