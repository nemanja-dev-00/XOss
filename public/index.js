document.addEventListener('DOMContentLoaded', () => {
  loadApp();
  Splitting({ target: '.loader-prgh', by: 'words' });
  customInput();

  localStorage.getItem('haptic_feedback') === null &&
    localStorage.setItem('haptic_feedback', true);

  localStorage.getItem('lock_zoom') === null &&
    localStorage.setItem('lock_zoom', false);

  localStorage.getItem('sfx') === null && localStorage.setItem('sfx', true);

  localStorage.getItem('music') === null && localStorage.setItem('music', true);

  addListeners();
});

document.addEventListener('click', checkBgSound);

function checkBgSound() {
  if (!bgSound) {
    playSound('bg');
    document.removeEventListener('click', checkBgSound);
    bgSound = true;
  }
}

function addListeners() {
  let authPageState = true;
  event.click('.login-type', () => {
    if (authPageState) {
      reanimateAuth(2);
      setTimeout(() => {
        Style(Get('.login-type'), {
          context: `Already have an account?<br /><span>Login here</span>`,
        });
      }, 300);
    } else {
      reanimateAuth(1);
      setTimeout(() => {
        Style(Get('.login-type'), {
          context: `Don't have an account?<br /><span>Create one here</span>`,
        });
      }, 300);
    }
    authPageState = !authPageState;
  });

  Array.from(GetAll('.submit')).map((btn) => {
    event.click(btn, () => {
      if (btn.getAttribute('type') === 'login') {
        loginUser(btn);
      } else {
        registerUser(btn);
      }
    });
  });

  window.passwordView = true;
  let resetViewTimeout;
  Array.from(GetAll('.password-reveal-input')).map((img) => {
    event.click(img, () => {
      if (window.passwordView) {
        img.parentNode.querySelector('.input-box-input').type = 'text';
        img.src = './assets/eye-off.svg';
        resetViewTimeout = setTimeout(() => {
          img.parentNode.querySelector('.input-box-input').type = 'password';
          img.src = './assets/eye.svg';
        }, 3000);
      } else {
        img.parentNode.querySelector('.input-box-input').type = 'password';
        img.src = './assets/eye.svg';
        clearTimeout(resetViewTimeout);
      }
      window.passwordView = !window.passwordView;
    });
  });

  event.click('.logoutBtn', () => {
    Style(Get(), {
      opacity: '0',
    });
    setTimeout(() => {
      localStorage.clear();
      window.location.reload();
    }, 600);
  });

  Array.from(GetAll('.option-2fa')).map((el) => {
    event.click(el, () => {
      if (!el.classList.contains('active-2fa-option')) {
        Get('.active-2fa-option').classList.remove('active-2fa-option');
        el.classList.add('active-2fa-option');
      }
    });
  });

  event.click('.submit-2fa', () => {
    fetch(
      `/updateAuthType?email=${localStorage.getItem('email')}&type=${Get(
        '.active-2fa-option'
      ).getAttribute('data-fa')}`
    )
      .then((res) => res.json())
      .then((data) => {
        Style('#twofa-optional', {
          opacity: '0',
        });
        setTimeout(() => {
          Style('#twofa-optional', {
            display: 'none',
          });
          renderApp();
        }, 500);
      });
  });

  event.click('.close2faauth', () => {
    localStorage.removeItem('mailVerify');
    Style('#twofa-auth', {
      opacity: '0',
    });
    setTimeout(() => {
      reanimateAuth(1);
    }, 200);
    setTimeout(() => {
      Style('#twofa-auth', {
        display: 'none',
      });
      Style('#auth', {
        display: 'flex',
      });
      setTimeout(() => {
        Style('#auth', {
          opacity: '1',
        });
      }, 10);
      Style('.title-verify-auth', {
        transform: 'translateY(1.5rem)',
        opacity: '0',
      });
      Style('.info-2fa-verify', {
        transform: 'translateY(1.5rem)',
        opacity: '0',
      });
      Style('.submit-2fa-verification', {
        transform: 'translateX(-50%)translateY(1.5rem)',
        opacity: '0',
      });
    }, 500);
  });

  event.click(Get('.submit-2fa-verification'), () => {
    fetch(`/checkAuth?email=${localStorage.getItem('mailVerify')}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.twofa.status == 'pending') {
          twoFAauthError('Email has not been verified yet');
        } else {
          Style(Get('#twofa-auth'), {
            opacity: '0',
          });
          setTimeout(() => {
            Style(Get('#twofa-auth'), {
              display: 'none',
            });
            localStorage.setItem('token', data.token);
            localStorage.setItem('email', localStorage.getItem('mailVerify'));
            localStorage.removeItem('mailVerify');
            setTimeout(() => {
              renderApp();
            }, 300);
          }, 300);
        }
      })
      .catch((err) => {
        twoFAauthError(err.message);
      });
  });

  const elemFullscreen = document.documentElement;
  function openFullscreen() {
    if (elemFullscreen.requestFullscreen) {
      elemFullscreen.requestFullscreen();
    } else if (elemFullscreen.webkitRequestFullscreen) {
      /* Safari */
      elemFullscreen.webkitRequestFullscreen();
    } else if (elemFullscreen.msRequestFullscreen) {
      /* IE11 */
      elemFullscreen.msRequestFullscreen();
    }
  }

  function closeFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      /* Safari */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      /* IE11 */
      document.msExitFullscreen();
    }
  }

  // event.click(Get('.fullscreenToggle'), () => {
  //   if (
  //     Get('.fullscreenToggle').classList.contains('activeFullscreen') == false
  //   ) {
  //     Get('.fullscreenToggle').classList.add('activeFullscreen');
  //     openFullscreen();
  //     return;
  //   }
  //   Get('.fullscreenToggle').classList.remove('activeFullscreen');
  //   closeFullscreen();
  // });

  Array.from(GetAll('.tab-wrapper')).map((el) => {
    event.click(el, () => {
      if (!el.classList.contains('active-tab-selector')) {
        Get('.active-tab-selector').classList.remove('active-tab-selector');
        setTimeout(() => {
          el.classList.add('active-tab-selector');
        }, 300);
      }
      if (el.getAttribute('tab-active') == 'settings') {
        importSettings();
        Style(Get('#app'), {
          transform: 'translateX(-100%)',
        });
        Style(Get('#settings'), {
          transform: 'translateX(0)',
        });
        setTimeout(() => {
          let expString = `${window.user.totalxp}`;
          Get('.total-exp').innerHTML = '';
          for (let i = 0; i < expString.length; i++) {
            let verticalWrapper = Create('div', {
              display: 'flex',
              flexDirection: 'column',
            });

            verticalWrapper.classList.add('vertical-wrapperxp');

            setTimeout(() => {
              Style(verticalWrapper, {
                transform: `translateY(${
                  -Number(expString.split('')[i]) * 2.5 - 2.5
                }rem)`,
              });
            }, (i + 1) * 50);

            verticalWrapper.innerHTML = `<p style="opacity: 0;">0</p><p>0</p><p>1</p><p>2</p><p>3</p><p>4</p><p>5</p><p>6</p><p>7</p><p>8</p><p>9</p>`;
            Append(verticalWrapper, Get('.total-exp'));
          }
          setTimeout(() => {
            let itmsArr = GetAll('.vertical-wrapperxp');
            let nodeArray = Array.from(itmsArr);
            nodeArray.reverse();

            nodeArray.map((el, index) => {
              if ((index + 1) % 3 == 0) {
                Style(el, {
                  paddingLeft: '.75rem',
                });
              }
            });
          }, 100);
        }, 300);
        setTimeout(() => {
          Style(Get('.accountPrivacy'), {
            opacity: '1',
            transform: 'translateY(0) translateX(-50%)',
          });
          setTimeout(() => {
            Style(Get('.logoutBtn'), {
              opacity: '.5',
              transform: 'translateY(0)',
            });
            setTimeout(() => {
              Style(Get('.user-info-wrapper'), {
                opacity: '1',
                transform: 'translateY(0) translateX(-50%)',
              });
              setTimeout(() => {
                Style(Get('.editBtn'), {
                  opacity: '.4',
                  transform: 'translateY(0)',
                });
                setTimeout(() => {
                  Array.from(GetAll('.settings-wrapper')).map((el, index) => {
                    setTimeout(() => {
                      Style(el, {
                        opacity: '1',
                        transform: 'translateY(0)',
                      });
                    }, 100 * index);
                  });
                }, 100);
              }, 100);
            }, 100);
          }, 100);
        }, 300);
      } else {
        Style(Get('#app'), {
          transform: 'translateX(0)',
        });
        Style(Get('#settings'), {
          transform: 'translateX(100%)',
        });
        setTimeout(() => {
          Style(Get('.accountPrivacy'), {
            opacity: '0',
            transform: 'translateY(1rem) translateX(-50%)',
          });
          Style(Get('.logoutBtn'), {
            opacity: '0',
            transform: 'translateY(1rem)',
          });
          Style(Get('.user-info-wrapper'), {
            opacity: '0',
            transform: 'translateY(1rem) translateX(-50%)',
          });
          Style(Get('.editBtn'), {
            opacity: '0',
            transform: 'translateY(1rem)',
          });
          Array.from(GetAll('.settings-wrapper')).map((el, index) => {
            setTimeout(() => {
              Style(el, {
                opacity: '0',
                transform: 'translateY(1rem)',
              });
            }, 100 * index);
          });
          setTimeout(() => {
            Get('.total-exp').innerHTML = '';
          }, 200);
        }, 600);
      }
    });
  });

  Array.from(GetAll('.accountPrivateType')).map((el) => {
    event.click(el, () => {
      responsesWait.show();
      fetch(
        `/changeAccountPrivacy?email=${window.user.email}&privateAccount=${
          el.getAttribute('val') == 'true' ? true : false
        }`
      )
        .then((res) => res.json())
        .then((data) => {
          window.user = data.result;
          if (data.status) {
            setTimeout(() => {
              responsesWait.hide();
              Get('.active-status-privacy').classList.remove(
                'active-status-privacy'
              );
              window.user.privateAccount
                ? Get('.isLocked').classList.add('active-status-privacy')
                : Get('.isUnlocked').classList.add('active-status-privacy');
              window.user.privateAccount
                ? (Get('.currentPrivacyStatus').innerText = 'Private')
                : (Get('.currentPrivacyStatus').innerText = 'Public');
            }, 500);
          } else {
          }
        })
        .catch((err) => {
          responsesWait.hide();
        });
    });
  });

  Array.from(GetAll('.checkbox-input')).map((el) => {
    el.addEventListener('input', () => {
      localStorage.setItem(`${el.getAttribute('storedAs')}`, el.checked);
      if (el.getAttribute('storedAs') == 'music') {
        if (el.checked) {
          newaudioElement.muted = false;
        } else {
          newaudioElement.muted = true;
        }
      }
    });
  });

  event.click(Get('.editBtn'), () => {
    Style(Get('.account-info-editable'), {
      display: 'block',
    });
    setTimeout(() => {
      Style(Get('.account-info-editable'), {
        opacity: '1',
      });
    }, 10);
  });

  event.click(Get('.closeAccountDetails'), () => {
    Style(Get('.account-info-editable'), {
      opacity: '0',
    });
    setTimeout(() => {
      Style(Get('.account-info-editable'), {
        display: 'none',
      });
    }, 650);
  });

  event.click(Get('.delete-account'), () => {
    criticalAlert(
      'Are you sure you want to delete your account? There is no going back after this.'
    )
      .then((result) => {
        setTimeout(() => {
          responsesWait.show();
          fetch(
            `/accountremoval?email=${
              window.user.email
            }&token=${localStorage.getItem('token')}`
          )
            .then((res) => res.json())
            .then((data) => {
              setTimeout(() => {
                if (data.approved) {
                  Style(Get(), {
                    opacity: '0',
                  });
                  setTimeout(() => {
                    localStorage.clear();
                    window.location.reload();
                  }, 600);
                } else {
                  // problem appeard during the process
                }
                responsesWait.hide();
              }, 1500);
            });
        }, 500);
      })
      .catch((error) => {
        Get('.checkbox-input-twofa').checked = true;
      });
  });

  Get('.checkbox-input-twofa').addEventListener('input', () => {
    if (Get('.checkbox-input-twofa').checked) {
      responsesWait.show();
      fetch(`/twofaupdate?email=${window.user.email}&type=${true}`)
        .then((res) => res.json())
        .then((data) => {
          window.user = data.result;
          setTimeout(() => {
            responsesWait.hide();
          }, 750);
        });
    } else {
      criticalAlert(
        'If you turn off the Two Factor Authentication your account will be easier to steal.'
      )
        .then((result) => {
          setTimeout(() => {
            responsesWait.show();
            fetch(`/twofaupdate?email=${window.user.email}&type=${false}`)
              .then((res) => res.json())
              .then((data) => {
                window.user = data.result;
                setTimeout(() => {
                  responsesWait.hide();
                }, 750);
              });
          }, 500);
        })
        .catch((error) => {
          setTimeout(() => {
            Get('.checkbox-input-twofa').checked = true;
          }, 400);
        });
    }
  });

  event.click(Get('.editDisplayName'), () => {
    createInputsEditTab('Change Display Name', ['New Display name'], 'dp')
      .then((data) => {
        window.user = data;
        Get('.display-name-info-txt').innerText = window.user.displayName;
        Get('.username-settings-preview').innerText = window.user.displayName;
        Get('.username').innerText = window.user.displayName;
        Style(Get('.settings-change-tab'), {
          opacity: '0',
        });
        setTimeout(() => {
          Style(Get('.settings-change-tab'), {
            display: 'none',
          });
          Style(Get('.title-edit'), {
            opacity: '0',
            transform: 'translateY(1rem)',
          });
          Style(Get('.confirm-edit'), {
            opacity: '0',
            transform: 'translateY(1rem)',
          });
        }, 600);
      })
      .catch((err) => {
        Style(Get('.settings-change-tab'), {
          opacity: '0',
        });
        setTimeout(() => {
          Style(Get('.settings-change-tab'), {
            display: 'none',
          });
          Style(Get('.title-edit'), {
            opacity: '0',
            transform: 'translateY(1rem)',
          });
          Style(Get('.confirm-edit'), {
            opacity: '0',
            transform: 'translateY(1rem)',
          });
        }, 600);
      });
  });

  event.click(Get('.editEmail'), () => {
    createInputsEditTab('Change Email', ['Old Email', 'New Email'], 'email')
      .then((data) => {
        window.user = data;
        localStorage.setItem('email', window.user.email);
        Get('.email-info-txt').innerText = `${window.user.email.charAt(
          0
        )}${window.user.email.charAt(1)}*********@${
          window.user.email.split('@')[1]
        }`;
        Get('.email-settings-preview').innerText = `${window.user.email.charAt(
          0
        )}${window.user.email.charAt(1)}*********@${
          window.user.email.split('@')[1]
        }`;
        Style(Get('.settings-change-tab'), {
          opacity: '0',
        });
        setTimeout(() => {
          Style(Get('.settings-change-tab'), {
            display: 'none',
          });
          Style(Get('.title-edit'), {
            opacity: '0',
            transform: 'translateY(1rem)',
          });
          Style(Get('.confirm-edit'), {
            opacity: '0',
            transform: 'translateY(1rem)',
          });
        }, 600);
      })
      .catch((err) => {
        Style(Get('.settings-change-tab'), {
          opacity: '0',
        });
        setTimeout(() => {
          Style(Get('.settings-change-tab'), {
            display: 'none',
          });
          Style(Get('.title-edit'), {
            opacity: '0',
            transform: 'translateY(1rem)',
          });
          Style(Get('.confirm-edit'), {
            opacity: '0',
            transform: 'translateY(1rem)',
          });
        }, 600);
      });
  });

  event.click(Get('.editPassword'), () => {
    createInputsEditTab(
      'Change Password',
      ['Old Password', 'New Password', 'Confirm New Password'],
      'pwd'
    )
      .then(() => {
        Style(Get('.settings-change-tab'), {
          opacity: '0',
        });
        setTimeout(() => {
          Style(Get('.settings-change-tab'), {
            display: 'none',
          });
          Style(Get('.title-edit'), {
            opacity: '0',
            transform: 'translateY(1rem)',
          });
          Style(Get('.confirm-edit'), {
            opacity: '0',
            transform: 'translateY(1rem)',
          });
        }, 600);
      })
      .catch((err) => {
        Style(Get('.settings-change-tab'), {
          opacity: '0',
        });
        setTimeout(() => {
          Style(Get('.settings-change-tab'), {
            display: 'none',
          });
          Style(Get('.title-edit'), {
            opacity: '0',
            transform: 'translateY(1rem)',
          });
          Style(Get('.confirm-edit'), {
            opacity: '0',
            transform: 'translateY(1rem)',
          });
        }, 600);
      });
  });

  let allowZoomLockClick = true;

  event.click(Get('.zoomToggle'), () => {
    if (Get('.board').getAttribute('allowZoom') != 'true') return;
    if (localStorage.getItem('lock_zoom') == 'true') {
      if (allowZoomLockClick) {
        allowZoomLockClick = false;
        Get(
          '.zoomToggle'
        ).innerHTML = `<img style="margin-left: -.5rem;" src="./assets/lock.svg" /><div class="text-wrapper">
            <div class="innerWrapper">
              <p>Locked</p>
              <p>Locked</p>
            </div>
          </div>`;
        setTimeout(() => {
          Get('.zoomToggle').innerHTML = `<svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="feather feather-zoom-in"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="11" y1="8" x2="11" y2="14"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
          <div class="text-wrapper">
            <div class="innerWrapper">
              <p>Zoom In</p>
              <p>Zoom Out</p>
            </div>
          </div>`;
          allowZoomLockClick = true;
        }, 1000);
      }
      return;
    }
    Get('.zoomToggle').classList.toggle('activeZoom');
    if (Get('.zoomToggle').classList.contains('activeZoom')) {
      Style(Get('.board'), {
        transformOrigin: `${Get('.board').getAttribute('origin-y')} ${Get(
          '.board'
        ).getAttribute('origin-x')}`,
      });
      setTimeout(() => {
        Style(Get('.board'), {
          transform: 'scale(3.05)',
        });
        Style(Get('.mainSpacers'), {
          opacity: '0',
        });
      }, 10);
      return;
    }

    Style(Get('.board'), {
      transform: 'scale(1)',
    });
    Style(Get('.mainSpacers'), {
      opacity: '1',
    });
  });

  event.click(Get('.algo'), () => {
    startGame('algo');
  });

  event.click(Get('.ai'), () => {
    startGame('ai');
  });

  event.click(Get('.ltm'), () => {
    startGame('ltm');
  });

  event.click(Get('.quickmatch'), () => {
    startQuickmatchQueue();
  });

  event.click(Get('.leaveGame'), () => {
    criticalAlert('Do you want to leave the game?')
      .then(() => {
        setTimeout(() => {
          responsesWait.show();
          setTimeout(() => {
            responsesWait.hide();
            Style(Get('#game-tab'), {
              opacity: '0',
            });
            setTimeout(() => {
              Style(Get('#game-tab'), {
                display: 'none',
              });
              Style(Get('.head'), {
                opacity: '0',
                transform: 'translateY(1rem) translateX(-50%)',
              });
              Style(Get('.movesStates'), {
                opacity: '0',
                transform: 'translateY(1rem) translateX(-50%)',
              });
              Style(Get('.board-overflow-controller'), {
                opacity: '0',
                transform: 'translateY(1rem) translateX(-50%)',
              });
              Style(Get('.zoomToggle'), {
                opacity: '0',
                transform: 'translateY(1rem) translateX(-50%)',
              });
              Style(Get('.turns'), {
                transform: 'translateY(100%)',
              });
              Get('.wrapper-oldest-played').innerHTML = `
              <p style="opacity: 0">00</p>
              <p style="opacity: 0">00</p>
            `;
              Style(Get('.wrapper-oldest-played'), {
                transform: 'translateY(0)',
              });
              Get('.wrapper-latest-played').innerHTML = `
              <p style="opacity: 0">00</p>
            `;
              Style(Get('.wrapper-latest-played'), {
                transform: 'translateY(0)',
              });
              Get('.board').setAttribute('allowZoom', 'false');
              if (Get('.activeField') !== null) {
                Get('.activeField').classList.remove('activeField');
              }
              window.transformIndex = 0;
              if (Get('.activeZoom') !== null) {
                Get('.activeZoom').classList.remove('activeZoom');
              }
              if (Get('.active-turn') !== null) {
                Get('.active-turn').classList.remove('active-turn');
              }
              for (let field of GetAll('.field')) {
                let clonedNode = field.cloneNode(true);
                Array.from(clonedNode.querySelectorAll('.pos')).map((elem) => {
                  elem.innerHTML = '';
                });
                field.replaceWith(clonedNode);
              }
              Array.from(GetAll('.bg-sign')).map((elem) => {
                elem.remove();
              });
              window.zoomed = false;
              Style(Get('.board'), {
                transform: 'scale(1)',
              });
              Style(Get('.mainSpacers'), {
                opacity: '1',
              });
            }, 300);
          }, 500);
        }, 300);
        try {
          wsocket.close();
          Get('.status-wrapper').querySelector(
            '.innerWrapper'
          ).innerHTML = `<p style="opacity: 0;">0</p>`;
          Style(Get('.status-wrapper').querySelector('.innerWrapper'), {
            transform: 'translateY(0)',
          });
          tqms = 0;
          joiningInProcess = false;
        } catch (e) {}
      })
      .catch((e) => {});
  });

  event.click(Get('.guide'), () => {
    Style(Get('#guideTab'), {
      display: 'flex',
    });
    setTimeout(() => {
      Style(Get('#guideTab'), {
        opacity: '1',
      });
      setTimeout(() => {
        Style(Get('.exitGuide'), {
          opacity: '.65',
          transform: 'scale(.85) translateY(0)',
        });
        setTimeout(() => {
          Style(Get('.video'), {
            opacity: '1',
          });
        }, 200);
      }, 500);
    }, 10);
  });

  event.click(Get('.exitGuide'), () => {
    Style(Get('#guideTab'), {
      opacity: '0',
    });
    setTimeout(() => {
      Style(Get('#guideTab'), {
        display: 'none',
      });
      Style(Get('.exitGuide'), {
        opacity: '0',
        transform: 'scale(.85) translateY(1.5rem)',
      });
      Style(Get('.video'), {
        opacity: '0',
      });
    }, 400);
  });
}

function loadApp() {
  setTimeout(() => {
    Style(GetAll('.logo-span')[0], {
      opacity: '1',
      transform: 'translateY(0)',
    });
    Style(GetAll('.logo-span')[1], {
      opacity: '1',
      transform: 'translateY(0)',
    });
    Style(Get('.loader-prgh'), {
      opacity: '.25',
    });
    setTimeout(() => {
      Style(Get('.logo-prgh'), {
        opacity: '1',
        transform: 'translateX(0)',
      });
      setTimeout(() => {
        Array.from(GetAll('.word')).map((word, index) => {
          setTimeout(() => {
            Style(word, {
              opacity: '1',
              transform: 'translateY(0)',
            });
          }, 60 * index);
        });
        setTimeout(async () => {
          Style(Get('.logo'), {
            filter: 'brightness(.35)',
          });
          setTimeout(() => {
            Style(Get('.logo'), {
              filter: 'brightness(1)',
            });
            setTimeout(() => {
              Style(Get('.logo'), {
                opacity: '0',
              });
            }, 800);
          }, 1000);

          try {
            if (localStorage.getItem('token') !== null) {
              const bearer = `Bearer ${localStorage.getItem('token')}`;
              const response = await fetch('/authorize', {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: bearer,
                },
              });
              const data = await response.json();

              if (!response.ok) {
                localStorage.removeItem('token');
                localStorage.removeItem('email');
              }
            }
            unloadLogo();
          } catch (e) {
            localStorage.removeItem('token');
            localStorage.removeItem('email');
            unloadLogo();
          }

          function unloadLogo() {
            setTimeout(() => {
              Style(GetAll('.logo-span')[0], {
                marginRight: '60vw',
              });
              Style(GetAll('.logo-span')[1], {
                marginLeft: '60vw',
              });
              Style(Get('.loader-prgh'), {
                opacity: '0',
              });

              setTimeout(() => {
                Style(Get('#loader'), {
                  display: 'none',
                });

                checkToken();
              }, 1500);
            }, 1000);
          }

          function checkToken() {
            if (localStorage.getItem('token') !== null) {
              renderApp();
            } else {
              Style(Get('#auth'), {
                display: 'block',
              });

              reanimateAuth(1);
            }
          }
        }, 500);
      }, 500);
    }, 300);
  }, 1000);
}

function customInput() {
  Array.from(GetAll('.wrapper-input-box')).map((el, index) => {
    el.querySelector('.placehold-faker').addEventListener('click', () => {
      Style(el.querySelector('.placehold-faker'), {
        height: '60%',
        fontSize: '.85rem',
      });
      el.querySelector('.input-box-input').focus();
    });

    el.querySelector('.input-box-input').addEventListener('blur', () => {
      if (el.querySelector('.input-box-input').value.length > 0) {
        Style(el.querySelector('.placehold-faker'), {
          height: '60%',
          fontSize: '.85rem',
          opacity: '.5',
        });
      } else {
        Style(el.querySelector('.placehold-faker'), {
          height: '100%',
          fontSize: '1.1rem',
          opacity: '.5',
        });
      }
    });

    el.querySelector('.input-box-input').addEventListener('focus', () => {
      Style(el.querySelector('.placehold-faker'), { opacity: '1' });
    });
  });
}

function twoFAauthError(msg) {
  Get('.error-2fa').innerText = msg;
  setTimeout(() => {
    Style(Get('.error-2fa'), {
      height: '1rem',
      opacity: '1',
      marginBottom: '.5rem',
    });

    setTimeout(() => {
      Style(Get('.error-2fa'), {
        height: '0',
        opacity: '0',
        marginBottom: '0',
      });
    }, 2000);
  }, 10);
}

function reanimateAuth(type) {
  setTimeout(() => {
    window.passwordView = true;
    Array.from(GetAll('.password-reveal-input')).map((img) => {
      img.parentNode.querySelector('.input-box-input').type = 'password';
      img.src = './assets/eye.svg';
    });
  }, 300);
  Style(Get('.login-type'), {
    opacity: '0',
  });
  if (type == 1) {
    Style(Get('#register'), {
      opacity: '0',
    });
    Style(Get('#login'), {
      display: 'flex',
    });
    setTimeout(() => {
      Style(Get('#register'), {
        display: 'none',
      });
      Style(Get('#login'), {
        opacity: '1',
      });
      Style(GetAll('.reloadable-auth1')[0], {
        opacity: '0',
        transform: 'translateY(1.5rem)',
      });
      Style(GetAll('.reloadable-auth1')[1], {
        opacity: '0',
        transform: 'translateY(1.5rem)',
      });
      Style(GetAll('.reloadable-auth1')[2], {
        opacity: '0',
        transform: 'translateY(1.5rem)',
      });
      Style(GetAll('.reloadable-auth1')[3], {
        opacity: '0',
        transform: 'translateY(1.5rem)',
      });
      Style(GetAll('.reloadable-auth1')[4], {
        opacity: '0',
        transform: 'translateY(1.5rem)',
      });

      Style(GetAll('.reloadable-auth')[0], {
        opacity: '1',
        transform: 'translateY(0)',
      });
      setTimeout(() => {
        Style(GetAll('.reloadable-auth')[1], {
          opacity: '1',
          transform: 'translateY(0)',
        });

        setTimeout(() => {
          Style(GetAll('.reloadable-auth')[2], {
            opacity: '1',
            transform: 'translateY(0)',
          });

          setTimeout(() => {
            Style(GetAll('.reloadable-auth')[3], {
              opacity: '1',
              transform: 'translateY(0)',
            });

            setTimeout(() => {
              Style(Get('.login-type'), {
                opacity: '1',
              });
            }, 300);
          }, 100);
        }, 100);
      }, 100);
    }, 300);
  } else {
    Style(Get('#login'), {
      opacity: '0',
    });
    Style(Get('#register'), {
      display: 'flex',
    });
    setTimeout(() => {
      Style(Get('#login'), {
        display: 'none',
      });
      Style(Get('#register'), {
        opacity: '1',
      });
      Style(GetAll('.reloadable-auth')[0], {
        opacity: '0',
        transform: 'translateY(1.5rem)',
      });
      Style(GetAll('.reloadable-auth')[1], {
        opacity: '0',
        transform: 'translateY(1.5rem)',
      });
      Style(GetAll('.reloadable-auth')[2], {
        opacity: '0',
        transform: 'translateY(1.5rem)',
      });
      Style(GetAll('.reloadable-auth')[3], {
        opacity: '0',
        transform: 'translateY(1.5rem)',
      });

      Style(GetAll('.reloadable-auth1')[0], {
        opacity: '1',
        transform: 'translateY(0)',
      });
      setTimeout(() => {
        Style(GetAll('.reloadable-auth1')[1], {
          opacity: '1',
          transform: 'translateY(0)',
        });

        setTimeout(() => {
          Style(GetAll('.reloadable-auth1')[2], {
            opacity: '1',
            transform: 'translateY(0)',
          });

          setTimeout(() => {
            Style(GetAll('.reloadable-auth1')[3], {
              opacity: '1',
              transform: 'translateY(0)',
            });

            setTimeout(() => {
              Style(GetAll('.reloadable-auth1')[4], {
                opacity: '1',
                transform: 'translateY(0)',
              });

              setTimeout(() => {
                Style(Get('.login-type'), {
                  opacity: '1',
                });
              }, 300);
            }, 100);
          }, 100);
        }, 100);
      }, 100);
    }, 300);
  }
}

function errorAuthInput(element, msg) {
  Style(element, {
    border: '2px solid #7b2626',
    marginBottom: '1.5rem',
  });
  Style(element.querySelector('.error'), {
    opacity: '1',
    content: msg,
  });

  setTimeout(() => {
    Style(element, {
      border: '2px solid transparent',
      marginBottom: '0',
    });
    Style(element.querySelector('.error'), {
      opacity: '0',
    });
  }, 2000);
}

function waitForResponseAuthAnimated(wrapper) {
  Style(wrapper.querySelector('p'), {
    opacity: '0',
  });
  Style(Get('.login-type'), {
    opacity: '0',
  });
  Style(wrapper, {
    backgroundColor: '#7e7e7e1f',
    width: '10rem',
    height: '.35rem',
  });
  setTimeout(() => {
    Style(wrapper.querySelector('.async-loader'), {
      opacity: '1',
      animation: 'wobble 2s ease-in-out infinite',
    });
    Style(Get('.login-type'), {
      display: 'none',
    });
  }, 450);
}

function respondedAuthError(wrapper, msg, btn) {
  errorAuthInput(wrapper, msg);
  Style(Get('.login-type'), {
    display: '',
  });
  Style(btn.querySelector('.async-loader'), {
    opacity: '0',
    animation: '',
  });
  Style(btn, {
    backgroundColor: '#bdfe00',
    width: '8rem',
    height: '3.25rem',
  });
  setTimeout(() => {
    Style(Get('.login-type'), {
      opacity: '1',
    });
  }, 10);
  setTimeout(() => {
    Style(btn.querySelector('p'), {
      opacity: '1',
    });
  }, 100);
}

async function loginUser(btn) {
  let data = {
    email: Get('.input-wrapper').querySelectorAll('input')[0].value,
    password: Get('.input-wrapper').querySelectorAll('input')[1].value,
  };

  if (data.email.length == 0) {
    return errorAuthInput(
      Get('.input-wrapper').querySelectorAll('.wrapper-input-box')[0],
      'Email is required'
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return errorAuthInput(
      Get('.input-wrapper').querySelectorAll('.wrapper-input-box')[0],
      'Invalid email format'
    );
  }

  if (data.password.length < 1) {
    return errorAuthInput(
      Get('.input-wrapper').querySelectorAll('.wrapper-input-box')[1],
      'Password is required'
    );
  }

  await waitForResponseAuthAnimated(btn);

  const fetchData = await fetch(
    `/login?email=${data.email}&password=${data.password}`
  );
  const response = await fetchData.json();

  await setTimeout(() => {
    if (response.status === 'success') {
      Style(Get('#auth'), { opacity: '0' });
      setTimeout(() => {
        Style(Get('#auth'), { display: 'none' });
        reanimateAuth(2);
        Style(Get('.login-type'), {
          display: '',
        });
        Style(GetAll('.submit')[0].querySelector('.async-loader'), {
          opacity: '0',
          animation: '',
        });
        Style(GetAll('.submit')[0], {
          backgroundColor: '#bdfe00',
          width: '8rem',
          height: '3.25rem',
        });
        setTimeout(() => {
          Style(Get('.login-type'), {
            opacity: '1',
          });
        }, 10);
        setTimeout(() => {
          Style(GetAll('.submit')[0].querySelector('p'), {
            opacity: '1',
          });
        }, 100);
      }, 300);
      if (response.twofa) {
        localStorage.setItem('mailVerify', data.email);
        Style(Get('#twofa-auth'), {
          display: 'flex',
        });
        setTimeout(() => {
          Style(Get('#twofa-auth'), {
            opacity: '1',
          });
        }, 10);
        setTimeout(() => {
          Style('.title-verify-auth', {
            transform: 'translateY(0)',
            opacity: '1',
          });
          setTimeout(() => {
            Style('.info-2fa-verify', {
              transform: 'translateY(0)',
              opacity: '.3',
            });
            setTimeout(() => {
              Style('.submit-2fa-verification', {
                transform: 'translateX(-50%)translateY(0)',
                opacity: '1',
              });
            }, 100);
          }, 100);
        }, 100);

        return;
      } else {
        localStorage.setItem('token', response.token);
        localStorage.setItem('email', data.email);
        setTimeout(() => {
          renderApp();
        }, 300);
      }
    } else {
      respondedAuthError(
        Get('.input-wrapper').querySelectorAll('.wrapper-input-box')[
          response.index
        ],
        response.message,
        btn
      );
    }
  }, 1500);
}

async function registerUser(btn) {
  let data = {
    email: Get('.input-wrapper1').querySelectorAll('input')[0].value,
    password: Get('.input-wrapper1').querySelectorAll('input')[1].value,
    displayName: Get('.input-wrapper1').querySelectorAll('input')[2].value,
  };

  if (data.email.length == 0) {
    return errorAuthInput(
      Get('.input-wrapper1').querySelectorAll('.wrapper-input-box')[0],
      'Email is required'
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return errorAuthInput(
      Get('.input-wrapper1').querySelectorAll('.wrapper-input-box')[0],
      'Invalid email format'
    );
  }

  if (data.password.length < 8) {
    return errorAuthInput(
      Get('.input-wrapper1').querySelectorAll('.wrapper-input-box')[1],
      'Password must have at least 8 characters'
    );
  }

  if (!/[A-Z]/.test(data.password)) {
    return errorAuthInput(
      Get('.input-wrapper1').querySelectorAll('.wrapper-input-box')[1],
      'Password must contain one capital letter'
    );
  }

  if (!/[^a-zA-Z0-9]/.test(data.password)) {
    return errorAuthInput(
      Get('.input-wrapper1').querySelectorAll('.wrapper-input-box')[1],
      'Password must contain special character'
    );
  }

  if (!/\d/.test(data.password)) {
    return errorAuthInput(
      Get('.input-wrapper1').querySelectorAll('.wrapper-input-box')[1],
      'Password must contain one number'
    );
  }

  if (data.displayName < 2) {
    return errorAuthInput(
      Get('.input-wrapper1').querySelectorAll('.wrapper-input-box')[2],
      'Display name must be 2 chars long'
    );
  }

  if (data.displayName.length > 12) {
    return errorAuthInput(
      Get('.input-wrapper1').querySelectorAll('.wrapper-input-box')[2],
      'Display name can have 12 characters max'
    );
  }

  await waitForResponseAuthAnimated(btn);

  const fetchData = await fetch(`/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  const response = await fetchData.json();

  await setTimeout(() => {
    if (response.status === 'success') {
      localStorage.setItem('token', response.token);
      localStorage.setItem('email', data.email);
      Style(Get('#auth'), { opacity: '0' });
      setTimeout(() => {
        Style(Get('#auth'), { display: 'none' });
        Style(Get('#twofa-optional'), { display: 'flex' });
        setTimeout(() => {
          Style('.auth-title-info', {
            transform: 'translateY(0)',
            opacity: '1',
          });
          setTimeout(() => {
            Style(GetAll('.option-2fa')[0], {
              transform: 'translateY(0)',
              opacity: '1',
            });
            setTimeout(() => {
              Style(GetAll('.option-2fa')[1], {
                transform: 'translateY(0)',
                opacity: '1',
              });
              setTimeout(() => {
                Style('.submit-2fa', {
                  transform: 'translateX(-50%) translateY(0)',
                  opacity: '1',
                });
              }, 100);
            }, 100);
          }, 100);
        }, 10);
      }, 300);
    } else {
      respondedAuthError(
        Get('.input-wrapper1').querySelectorAll('.wrapper-input-box')[
          response.index
        ],
        response.message,
        btn
      );
    }
  }, 1500);
}

let bgSound = false;
async function renderApp() {
  const response = await fetch(
    `/userData?email=${localStorage.getItem('email')}`
  );
  const data = await response.json();
  window.user = data;
  // const quotes = [
  //   `Consistency is key to achieving your goals`,
  //   `Perseverance is not a long race`,
  //   `Success is the sum of small efforts`,
  //   'What we think, we become',
  //   `In the end, we only regret the chances we didn't take`,
  // ];
  Get('.username').innerText = data.displayName;
  Get('.quote').innerText = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });
  await Style(Get('#app'), {
    display: 'flex',
  });
  await importSettings();

  setTimeout(() => {
    const timeOut = 80;

    Style(Get('.greet'), {
      transform: 'translateY(0)',
      opacity: '1',
    });

    setTimeout(() => {
      Style(Get('.quote'), {
        transform: 'translateY(0)',
        opacity: '.4',
      });
      setTimeout(() => {
        Style(Get('.algo'), {
          transform: 'translateX(0)',
          opacity: '1',
        });
        setTimeout(() => {
          Style(Get('.algo'), {
            transform: '',
          });
        }, 750);
        setTimeout(() => {
          Style(Get('.ai'), {
            transform: 'translateX(0)',
            opacity: '1',
          });
          setTimeout(() => {
            Style(Get('.ai'), {
              transform: '',
            });
          }, 750);
          setTimeout(() => {
            Style(Get('.customs'), {
              transform: 'translateY(0)',
              opacity: '1',
            });
            setTimeout(() => {
              Style(Get('.customs'), {
                transform: '',
              });
            }, 750);
            setTimeout(() => {
              Style(Get('.quickmatch'), {
                transform: 'translateY(0)',
                opacity: '1',
              });
              setTimeout(() => {
                Style(Get('.quickmatch'), {
                  transform: '',
                });
              }, 750);
              setTimeout(() => {
                Style(Get('.friends'), {
                  transform: 'translateX(0)',
                  opacity: '1',
                });
                setTimeout(() => {
                  Style(Get('.friends'), {
                    transform: '',
                  });
                }, 750);
                setTimeout(() => {
                  Style(Get('.ltm'), {
                    transform: 'translateX(0)',
                    opacity: '1',
                  });
                  setTimeout(() => {
                    Style(Get('.ltm'), {
                      transform: '',
                    });
                  }, 750);
                  setTimeout(() => {
                    Style(Get('.guide'), {
                      transform: 'translateX(0)',
                      opacity: '1',
                    });
                    setTimeout(() => {
                      Style(Get('.guide'), {
                        transform: '',
                      });
                    }, 750);
                    setTimeout(() => {
                      Style(Get('.navigation'), {
                        display: 'flex',
                      });
                      setTimeout(() => {
                        Style(Get('.navigation'), {
                          transform: 'translateY(0) translateX(-50%)',
                          opacity: '1',
                        });
                      }, 10);
                    }, timeOut + 500);
                  }, timeOut);
                }, timeOut);
              }, timeOut);
            }, timeOut);
          }, timeOut);
        }, timeOut);
      }, timeOut);
    }, timeOut);
    try {
      playSound('bg');
      bgSound = true;
    } catch (err) {}
  }, 300);
}

let newaudioElement;
function playSound(sound) {
  const sounds = {
    win: './assets/sfx/win.mp3',
    lose: './assets/sfx/lose.mp3',
    capture: './assets/sfx/field-capture.mp3',
    bg: './assets/sfx/bg-sound.mp3',
  };
  let audioElement = new Audio();
  audioElement.src = sounds[sound];
  if (sound == 'bg') {
    newaudioElement = new Audio();
    newaudioElement.src = sounds[sound];
    newaudioElement.loop = true;
    try {
      if (!bgSound) {
        bgSound = true;
        newaudioElement.play().catch((err) => {
          bgSound = false;
        });
      }
    } catch (e) {}
    if (localStorage.getItem('music') == 'false') {
      newaudioElement.muted = true;
    }
  } else {
    if (localStorage.getItem('sfx') == 'true') {
      audioElement.play();
    }
  }
}

function importSettings() {
  Get('.username-settings-preview').innerText = window.user.displayName;
  Get('.email-settings-preview').innerText = `${window.user.email.charAt(
    0
  )}${window.user.email.charAt(1)}**********@${
    window.user.email.split('@')[1]
  }`;
  window.user.privateAccount
    ? Get('.isLocked').classList.add('active-status-privacy')
    : Get('.isUnlocked').classList.add('active-status-privacy');
  window.user.privateAccount
    ? (Get('.currentPrivacyStatus').innerText = 'Private')
    : (Get('.currentPrivacyStatus').innerText = 'Public');
  Get('.wins').innerText = `Wins: ${window.user.wins}`;
  Get('.wl-ratio').innerText =
    window.user.played > 0
      ? `W/L Ratio: ${(
          Number(window.user.wins) /
          Number(window.user.played - window.user.wins)
        ).toFixed(1)}`
      : 'W/L Ratio: 0';
  Get('.total-matches').innerText = `Matches played: ${window.user.played}`;
  Array.from(GetAll('.checkbox-input')).map((el) => {
    localStorage.getItem(`${el.getAttribute('storedAs')}`) == 'true'
      ? (el.checked = true)
      : '';
  });
  window.user.twofa.type == true
    ? (Get('.checkbox-input-twofa').checked = true)
    : '';
  Get('.display-name-info-txt').innerText = window.user.displayName;
  Get('.email-info-txt').innerText = `${window.user.email.charAt(
    0
  )}${window.user.email.charAt(1)}**********@${
    window.user.email.split('@')[1]
  }`;
}

const responsesWait = {
  show: () => {
    Style(Get('.waitingOverlay'), {
      display: 'grid',
    });
    setTimeout(() => {
      Style(Get('.waitingOverlay'), {
        opacity: '1',
      });
    }, 10);
  },
  hide: () => {
    Style(Get('.waitingOverlay'), {
      opacity: '0',
    });
    setTimeout(() => {
      Style(Get('.waitingOverlay'), {
        display: 'none',
      });
    }, 300);
  },
};

function criticalAlert(msg) {
  return new Promise((resolve, reject) => {
    Get('.msg-ca').innerText = msg;
    Style(Get('.criticalAlert'), {
      display: 'block',
    });

    setTimeout(() => {
      Style(Get('.criticalAlert'), {
        opacity: '1',
      });
      setTimeout(() => {
        Style(Get('.insideWrapperAlert'), {
          transform: 'translateX(-50%) scale(1) translateY(0)',
        });
      }, 150);
    }, 10);

    Get('.cancel-alert').addEventListener('click', () => {
      reject('Cancelled');
      closeCriticalAlert();
    });
    Get('.confirm-alert').addEventListener('click', () => {
      resolve('Confirmed');
      closeCriticalAlert();
    });
  });
}

function closeCriticalAlert() {
  Style(Get('.insideWrapperAlert'), {
    transform: 'translateX(-50%) scale(0.95) translateY(calc(100% + 5.5rem))',
  });
  setTimeout(() => {
    Style(Get('.criticalAlert'), {
      opacity: '0',
    });
    setTimeout(() => {
      Style(Get('.criticalAlert'), {
        display: 'none',
      });
    }, 300);
  }, 500);
}

function createInputsEditTab(title, inputs, type) {
  return new Promise((resolve, reject) => {
    Get('.confirm-edit').remove();
    const btn = Create('div');
    btn.classList.add('confirm-edit');
    btn.innerText = 'Confirm';
    btn.setAttribute('type', type);
    Append(btn, Get('.centeredContent'));
    event.click(btn, () => {
      let data = [];
      Array.from(GetAll('.input-box-input-edit')).map((el) => {
        data.push(el.value);
      });
      responsesWait.show();
      setTimeout(() => {
        if (Get('.confirm-edit').getAttribute('type') == 'dp') {
          if (data[0].length < 2) {
            errorDataEditInput(
              Get('.inputs-wrapper').querySelectorAll('.wrapper-input-box')[0],
              'Display name must be 2 chars long'
            );
            responsesWait.hide();
            return;
          }
          if (data[0].length > 12) {
            errorDataEditInput(
              Get('.inputs-wrapper').querySelectorAll('.wrapper-input-box')[0],
              'Display name can have 12 characters max'
            );
            responsesWait.hide();
            return;
          }
          fetch(
            `/updateUsername?newDP=${data[0]}&token=${localStorage.getItem(
              'token'
            )}`
          )
            .then((res) => res.json())
            .then((data) => {
              if (data.approved) {
                responsesWait.hide();
                resolve(data.result);
                return;
              }

              responsesWait.hide();
              setTimeout(() => {
                errorDataEditInput(
                  Get('.inputs-wrapper').querySelectorAll('.wrapper-input-box')[
                    data.index
                  ],
                  data.msg
                );
              }, 100);
            })
            .catch((e) => {});
        }
        if (Get('.confirm-edit').getAttribute('type') == 'email') {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data[0])) {
            errorDataEditInput(
              Get('.inputs-wrapper').querySelectorAll('.wrapper-input-box')[0],
              'Invalid email address'
            );
            responsesWait.hide();
            return;
          }
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data[1])) {
            errorDataEditInput(
              Get('.inputs-wrapper').querySelectorAll('.wrapper-input-box')[1],
              'Invalid email address'
            );
            responsesWait.hide();
            return;
          }
          fetch(
            `/updateEmail?oldEmail=${data[0]}&newEmail=${
              data[1]
            }&token=${localStorage.getItem('token')}`
          )
            .then((res) => res.json())
            .then((data) => {
              if (data.approved) {
                responsesWait.hide();
                localStorage.setItem('token', data.token);
                resolve(data.result);
                return;
              }

              responsesWait.hide();
              setTimeout(() => {
                errorDataEditInput(
                  Get('.inputs-wrapper').querySelectorAll('.wrapper-input-box')[
                    data.index
                  ],
                  data.msg
                );
              }, 100);
            })
            .catch((e) => {});
        }
        if (Get('.confirm-edit').getAttribute('type') == 'pwd') {
          if (data[0].length == 0) {
            errorDataEditInput(
              Get('.inputs-wrapper').querySelectorAll('.wrapper-input-box')[0],
              'Invalid password'
            );
            responsesWait.hide();
            return;
          }

          if (data[1].length == 0) {
            errorDataEditInput(
              Get('.inputs-wrapper').querySelectorAll('.wrapper-input-box')[1],
              'Invalid password'
            );
            responsesWait.hide();
            return;
          }

          if (data[2].length == 0) {
            errorDataEditInput(
              Get('.inputs-wrapper').querySelectorAll('.wrapper-input-box')[2],
              'Password confirmation is required'
            );
            responsesWait.hide();
            return;
          }

          if (data[1] !== data[2]) {
            errorDataEditInput(
              Get('.inputs-wrapper').querySelectorAll('.wrapper-input-box')[2],
              'New passwords do not match'
            );
            responsesWait.hide();
            return;
          }

          if (data[2].length < 8) {
            errorDataEditInput(
              Get('.inputs-wrapper').querySelectorAll('.wrapper-input-box')[2],
              'Password must have at least 8 characters'
            );
            responsesWait.hide();
            return;
          }

          if (!/[A-Z]/.test(data[2])) {
            errorDataEditInput(
              Get('.inputs-wrapper').querySelectorAll('.wrapper-input-box')[2],
              'Password must contain one capital letter'
            );
            responsesWait.hide();
            return;
          }

          if (!/[^a-zA-Z0-9]/.test(data[2])) {
            errorDataEditInput(
              Get('.inputs-wrapper').querySelectorAll('.wrapper-input-box')[2],
              'Password must contain special character'
            );
            responsesWait.hide();
            return;
          }

          if (!/\d/.test(data[2])) {
            errorDataEditInput(
              Get('.inputs-wrapper').querySelectorAll('.wrapper-input-box')[2],
              'Password must contain one number'
            );
            responsesWait.hide();
            return;
          }

          fetch(
            `/updatePassword?oldPwd=${data[0]}&newPwd=${
              data[1]
            }&token=${localStorage.getItem('token')}`
          )
            .then((res) => res.json())
            .then((data) => {
              if (data.approved) {
                responsesWait.hide();
                window.user = data.result;
                localStorage.setItem('token', data.token);
                resolve();
                return;
              }

              responsesWait.hide();
              setTimeout(() => {
                errorDataEditInput(
                  Get('.inputs-wrapper').querySelectorAll('.wrapper-input-box')[
                    data.index
                  ],
                  data.msg
                );
              }, 100);
            })
            .catch((e) => {});
        }
      }, 500);
    });
    Style(Get('.settings-change-tab'), {
      display: 'block',
    });
    Get('.title-edit').innerText = title;
    setTimeout(() => {
      Style(Get('.settings-change-tab'), {
        opacity: '1',
      });
      Get('.inputs-wrapper').innerHTML = '';
      inputs.map((details) => {
        Get('.inputs-wrapper').innerHTML += `
          <div class="wrapper-input-box">
            <input type="text" class="input-box-input input-box-input-edit" />
            <p class="placehold-faker">${details}</p>
            <p class="error"></p>
          </div>`;
      });
      Array.from(
        Get('.inputs-wrapper').querySelectorAll('.wrapper-input-box')
      ).map((el, index) => {
        el.querySelector('.placehold-faker').addEventListener('click', () => {
          Style(el.querySelector('.placehold-faker'), {
            height: '60%',
            fontSize: '.85rem',
          });
          el.querySelector('.input-box-input').focus();
        });

        el.querySelector('.input-box-input').addEventListener('blur', () => {
          if (el.querySelector('.input-box-input').value.length > 0) {
            Style(el.querySelector('.placehold-faker'), {
              height: '60%',
              fontSize: '.85rem',
              opacity: '.5',
            });
          } else {
            Style(el.querySelector('.placehold-faker'), {
              height: '100%',
              fontSize: '1.1rem',
              opacity: '.5',
            });
          }
        });

        el.querySelector('.input-box-input').addEventListener('focus', () => {
          Style(el.querySelector('.placehold-faker'), { opacity: '1' });
        });
      });
      Style(Get('.title-edit'), {
        opacity: '1',
        transform: 'translateY(0)',
      });
      setTimeout(() => {
        Array.from(
          Get('.inputs-wrapper').querySelectorAll('.wrapper-input-box')
        ).map((el, index) => {
          setTimeout(() => {
            Style(el, {
              opacity: '1',
              transform: 'translateY(0)',
            });
          }, 100 * index);
        });
        setTimeout(() => {
          Style(Get('.confirm-edit'), {
            opacity: '1',
            transform: 'translateY(0)',
          });
        }, Get('.inputs-wrapper').querySelectorAll('.wrapper-input-box').length * 100 + 100);
      }, 300);
    });

    event.click(Get('.closeEditTab'), () => {
      reject();
    });
  });
}

function errorDataEditInput(element, msg) {
  Style(element, {
    border: '2px solid #7b2626',
    marginBottom: '1.5rem',
  });
  Style(element.querySelector('.error'), {
    opacity: '1',
    content: msg,
  });

  setTimeout(() => {
    Style(element, {
      border: '2px solid transparent',
      marginBottom: '0',
    });
    Style(element.querySelector('.error'), {
      opacity: '0',
    });
  }, 2000);
}

const origins = {
  1: {
    x: 'left',
    y: 'top',
  },
  2: {
    x: 'center',
    y: 'top',
  },
  3: {
    x: 'right',
    y: 'top',
  },
  4: {
    x: 'left',
    y: 'center',
  },
  5: {
    x: 'center',
    y: 'center',
  },
  6: {
    x: 'right',
    y: 'center',
  },
  7: {
    x: 'left',
    y: 'bottom',
  },
  8: {
    x: 'center',
    y: 'bottom',
  },
  9: {
    x: 'right',
    y: 'bottom',
  },
};

const fieldMap = {
  x: ['A', 'B', 'C', 'A', 'B', 'C', 'A', 'B', 'C'],
  y: ['1', '1', '1', '2', '2', '2', '3', '3', '3'],
};

const modes = {
  algo: 'Algo Gen. II',
  ai: 'AI Superb',
  ltm: 'LTM Algo',
};

let cim;

async function startGame(mode) {
  await responsesWait.show();
  setTimeout(async () => {
    await responsesWait.hide();
    Get('.clock').innerText = `${getCurrentTime()}`;
    Get('.player').querySelector('p').innerText = window.user.displayName;
    Get('.opponent').querySelector('p').innerText = modes[`${mode}`];
    await loadGame();
    window.latestPos = '';
    window.transformIndex = 0;
    cim = mode;
    await sessionStorage.setItem(
      'position',
      JSON.stringify([
        { 1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: '', 9: '' },
        { 1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: '', 9: '' },
        { 1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: '', 9: '' },
        { 1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: '', 9: '' },
        { 1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: '', 9: '' },
        { 1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: '', 9: '' },
        { 1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: '', 9: '' },
        { 1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: '', 9: '' },
        { 1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: '', 9: '' },
      ])
    );
    await sessionStorage.setItem(
      'main_position',
      JSON.stringify({
        1: '',
        2: '',
        3: '',
        4: '',
        5: '',
        6: '',
        7: '',
        8: '',
        9: '',
      })
    );
    setTimeout(() => {
      inGameAlert('Choose field to start.', 1500);
      setTimeout(() => {
        inGameAlert('You are on the spot.', 1500);
        setTimeout(() => {
          vibrateOnTouch(250);
        }, 1700);
        setTimeout(() => {
          Get('.player').classList.add('active-turn');
          setTimeout(() => {
            for (let field of GetAll('.field')) {
              function handleClick() {
                mapElsStart(field);
                window.latestPos = `${
                  fieldMap.x[Number(field.getAttribute('pos')) - 1]
                }${fieldMap.y[Number(field.getAttribute('pos')) - 1]}`;
                updateLastesPosition();
                field.removeEventListener('click', handleClick);
              }

              field.addEventListener('click', handleClick);
            }

            function mapElsStart(el) {
              window.zoomed = false;
              const board = Get('.board');
              const pos = el.getAttribute('pos');
              updateOrigin(origins[pos].x, origins[pos].y);
              board.setAttribute('allowZoom', true);
              zoomBoard();
              GetAll('.field')[Number(pos) - 1].classList.add('activeField');
              disableFieldClick();
              window.playerMove = true;
              runFieldPlay();
            }

            function disableFieldClick() {
              for (let field of GetAll('.field')) {
                field.replaceWith(field.cloneNode(true));
              }
            }
          }, 300);
        }, 1500);
      }, 2000);
    }, 1500);
    setInterval(() => {
      Get('.clock').innerText = `${getCurrentTime()}`;
    }, 5000);
  }, 1500);
}

function updateOrigin(x, y) {
  const board = Get('.board');
  board.setAttribute('origin-x', x);
  board.setAttribute('origin-y', y);
}

function zoomBoard(forceZoom = { unzoom: false, zoom: false }) {
  const lockZoom = localStorage.getItem('lock_zoom');
  Style(Get('.board'), {
    transformOrigin: `${Get('.board').getAttribute('origin-y')} ${Get(
      '.board'
    ).getAttribute('origin-x')}`,
  });
  if (lockZoom == 'false') {
    Get('.zoomToggle').classList.toggle('activeZoom');
    window.zoomed = !window.zoomed;
  }
  setTimeout(() => {
    if (lockZoom == 'false') {
      if (forceZoom.unzoom) {
        Style(Get('.board'), {
          transform: 'scale(1)',
        });
        Style(Get('.mainSpacers'), {
          opacity: '1',
        });
        return;
      }
      if (forceZoom.zoom) {
        Style(Get('.board'), {
          transform: 'scale(3.05)',
        });
        Style(Get('.mainSpacers'), {
          opacity: '0',
        });
        return;
      }
      if (Get('.zoomToggle').classList.contains('activeZoom')) {
        setTimeout(() => {
          Style(Get('.board'), {
            transform: 'scale(3.05)',
          });
          Style(Get('.mainSpacers'), {
            opacity: '0',
          });
        }, 10);
      } else {
        Style(Get('.board'), {
          transform: 'scale(1)',
        });
        Style(Get('.mainSpacers'), {
          opacity: '1',
        });
      }
    }
  }, 10);
}

function vibrateOnTouch(delay = 0) {
  if (localStorage.getItem('haptic_feedback') == 'true') {
    if ('vibrate' in navigator) {
      navigator.vibrate(delay);
    }
  }
}

function runFieldPlay() {
  if (window.playerMove) {
    Array.from(Get('.activeField').querySelectorAll('.pos')).map(
      (element, index) => {
        event.click(element, () => {
          let positions = JSON.parse(sessionStorage.getItem('position'));
          if (
            positions[`${Number(Get('.activeField').getAttribute('pos')) - 1}`][
              `${index + 1}`
            ] == ''
          ) {
            vibrateOnTouch(50);
            positions[`${Number(Get('.activeField').getAttribute('pos')) - 1}`][
              `${index + 1}`
            ] = 'X';
            window.latestPos = `${fieldMap.x[Number(index)]}${
              fieldMap.y[index]
            }`;
            updateLastesPosition();
            if (cim == 'algo' || cim == 'ai') {
              element.innerHTML = `<img src="./assets/x.svg" />`;
            }
            if (cim == 'ltm') {
              element.innerHTML = `<img style="width: 1.1rem; filter: brightness(0.5);" src="./assets/blind-eye.svg" />`;
            }
            setTimeout(() => {
              if (element.querySelector('img') !== null) {
                Style(element.querySelector('img'), {
                  transform: 'scale(1)',
                  opacity: '1',
                });
              }
            }, 100);
            sessionStorage.setItem('position', JSON.stringify(positions));
            checkFieldSign();
            window.playerMove = false;
            setTimeout(() => {
              Array.from(Get('.activeField').querySelectorAll('.pos')).map(
                (el) => {
                  const clonedElement = el.cloneNode(true);
                  el.parentNode.replaceChild(clonedElement, el);
                }
              );
            }, 300);
            if (window.zoomed) {
              zoomBoard({ unzoom: true, zoom: false });
              if (Get('.activeZoom') !== null) {
                Get('.activeZoom').classList.remove('activeZoom');
              }
            }
            setTimeout(() => {
              Get('.activeField').classList.remove('activeField');
              setTimeout(() => {
                updateOrigin(origins[index + 1].x, origins[index + 1].y);
                if (!checkWin()) {
                  zoomBoard({ unzoom: false, zoom: true });
                  GetAll('.field')[index].classList.add('activeField');
                  Get('.active-turn').classList.remove('active-turn');
                  setTimeout(() => {
                    Get('.opponent').classList.add('active-turn');
                  }, 250);
                  runFieldPlay();
                } else {
                  zoomBoard({ unzoom: true, zoom: false });
                  endGame('You won the match');
                  playSound('win');
                }
              }, 200);
            }, 450);
          } else {
            vibrateOnTouch(25);
            setTimeout(() => {
              vibrateOnTouch(25);
            }, 75);
          }
        });
      }
    );
  } else {
    async function runBot() {
      let positions = await JSON.parse(sessionStorage.getItem('position'));
      let genP;
      if (cim == 'algo') {
        genP = (await Math.floor(Math.random() * 9)) + 1;
      }
      if (cim == 'ai' || cim == 'ltm') {
        const winCombs = [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9],
          [1, 4, 7],
          [2, 5, 8],
          [3, 6, 9],
          [1, 5, 9],
          [3, 5, 7],
        ];

        let cmb = '';

        function findWinningMove(board, botSymbol) {
          for (let combo of winCombs) {
            const [a, b, c] = combo;
            const values = [board[a], board[b], board[c]];
            if (
              values.filter((value) => value === botSymbol).length === 2 &&
              values.includes('')
            ) {
              const emptyIndex = values.indexOf('');
              cmb = combo[emptyIndex];
              break;
            }
          }
          return;
        }

        function findCriticalMove(board, currentSymbol) {
          for (let combo of winCombs) {
            const [a, b, c] = combo;
            const values = [board[a], board[b], board[c]];
            if (
              values.filter((value) => value === currentSymbol).length === 2 &&
              values.includes('')
            ) {
              const emptyIndex = values.indexOf('');
              cmb = combo[emptyIndex];
              return;
            }
          }
          return;
        }

        await findWinningMove(
          positions[`${Number(Get('.activeField').getAttribute('pos')) - 1}`],
          'O'
        );
        if (cmb != '') {
          genP = cmb;
        } else {
          await findCriticalMove(
            positions[`${Number(Get('.activeField').getAttribute('pos')) - 1}`],
            'X'
          );
          if (cmb != '') {
            genP = cmb;
          } else {
            genP = (await Math.floor(Math.random() * 9)) + 1;
          }
        }
      }
      if (
        positions[`${Number(Get('.activeField').getAttribute('pos')) - 1}`][
          `${genP}`
        ] == ''
      ) {
        await vibrateOnTouch(50);
        positions[`${Number(Get('.activeField').getAttribute('pos')) - 1}`][
          `${genP}`
        ] = 'O';
        window.latestPos = `${fieldMap.x[Number(genP - 1)]}${
          fieldMap.y[genP - 1]
        }`;
        await updateLastesPosition();
        if (cim == 'algo' || cim == 'ai') {
          Get('.activeField').querySelectorAll('.pos')[
            genP - 1
          ].innerHTML = `<img src="./assets/o.svg" />`;
        }
        if (cim == 'ltm') {
          Get('.activeField').querySelectorAll('.pos')[
            genP - 1
          ].innerHTML = `<img style="width: 1.1rem; filter: brightness(0.5);" src="./assets/blind-eye.svg" />`;
        }
        await setTimeout(() => {
          if (
            Get('.activeField')
              .querySelectorAll('.pos')
              [genP - 1].querySelector('img') !== null
          ) {
            Style(
              Get('.activeField')
                .querySelectorAll('.pos')
                [genP - 1].querySelector('img'),
              {
                transform: 'scale(1)',
                opacity: '1',
              }
            );
          }
        }, 100);
        sessionStorage.setItem('position', JSON.stringify(positions));
        checkFieldSign();
        window.playerMove = true;
        zoomBoard({ unzoom: true, zoom: false });
        setTimeout(() => {
          Get('.activeField').classList.remove('activeField');
          setTimeout(() => {
            updateOrigin(origins[genP].x, origins[genP].y);
            if (!checkWin()) {
              zoomBoard({ unzoom: false, zoom: true });
              GetAll('.field')[genP - 1].classList.add('activeField');
              Get('.active-turn').classList.remove('active-turn');
              setTimeout(() => {
                Get('.player').classList.add('active-turn');
              }, 250);
              runFieldPlay();
            } else {
              zoomBoard({ unzoom: true, zoom: false });
              if (cim == 'algo') {
                endGame('Bot won this time');
                playSound('lose');
              }
              if (cim == 'ai') {
                endGame('AI won this time');
                playSound('lose');
              }
            }
          }, 200);
        }, 450);
      } else {
        runBot();
      }
    }
    setTimeout(() => {
      runBot();
    }, 1000);
  }
}

function generatePosition() {
  return Math.floor(Math.random() * 9) + 1;
}

function hasNonEmptyValues(obj) {
  return Object.values(obj).every((value) => value.length > 0);
}

function endGame(msg) {
  const wrapper = Create('div', {
    width: '100vw',
    height: '100dvh',
    position: 'absolute',
    left: '0',
    top: '0',
    zIndex: '3',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    transition: '.5s',
    opacity: '0',
    backgroundColor: '#101010d4',
    backdropFilter: 'blur(5px)',
    webkitBackdropFilter: 'blur(5px)',
    gap: '1rem',
  });

  wrapper.classList.add('endGameInfo');
  wrapper.innerHTML = `
    <h1 style="color: #fff; font-weight: 600; font-size: 1.3rem; text-align: center; width: 80%; line-height: 1.6rem; opacity: .7;">${
      msg == 'disconnected' ? `${window.opponent} has left the game` : msg
    }</h1>
  `;
  const exitBtn = Create('div');
  exitBtn.innerHTML = `
    <img style="width: 1.3rem; height: auto;" src="./assets/arrow-back.svg">
    Exit
  `;
  Style(exitBtn, {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: '.4rem',
    backgroundColor: '#1F1F1F',
    borderRadius: '0.5rem',
    opacity: '.5',
    width: '6rem',
    height: '3rem',
    fontSize: '.9rem',
  });
  event.click(exitBtn, () => {
    responsesWait.show();
    setTimeout(() => {
      responsesWait.hide();
      Style(Get('#game-tab'), {
        opacity: '0',
      });
      setTimeout(() => {
        Style(Get('#game-tab'), {
          display: 'none',
        });
        Style(Get('.head'), {
          opacity: '0',
          transform: 'translateY(1rem) translateX(-50%)',
        });
        Style(Get('.movesStates'), {
          opacity: '0',
          transform: 'translateY(1rem) translateX(-50%)',
        });
        Style(Get('.board-overflow-controller'), {
          opacity: '0',
          transform: 'translateY(1rem) translateX(-50%)',
        });
        Style(Get('.zoomToggle'), {
          opacity: '0',
          transform: 'translateY(1rem) translateX(-50%)',
        });
        Style(Get('.turns'), {
          transform: 'translateY(100%)',
        });
        Get('.wrapper-oldest-played').innerHTML = `
              <p style="opacity: 0">00</p>
              <p style="opacity: 0">00</p>
            `;
        Style(Get('.wrapper-oldest-played'), {
          transform: 'translateY(0)',
        });
        Get('.wrapper-latest-played').innerHTML = `
              <p style="opacity: 0">00</p>
            `;
        Style(Get('.wrapper-latest-played'), {
          transform: 'translateY(0)',
        });
        Style(Get('.board'), {
          transformOrigin: '',
        });
        Get('.status-wrapper').querySelector(
          '.innerWrapper'
        ).innerHTML = `<p style="opacity: 0;">0</p>`;
        Style(Get('.status-wrapper').querySelector('.innerWrapper'), {
          transform: 'translateY(0)',
        });
        tqms = 0;
        Get('.endGameInfo').remove();
        if (Get('.activeField') !== null) {
          Get('.activeField').classList.remove('activeField');
        }
        window.transformIndex = 0;
        if (Get('.activeZoom') !== null) {
          Get('.activeZoom').classList.remove('activeZoom');
        }
        if (Get('.active-turn') !== null) {
          Get('.active-turn').classList.remove('active-turn');
        }
        for (let field of GetAll('.field')) {
          let clonedNode = field.cloneNode(true);
          Array.from(clonedNode.querySelectorAll('.pos')).map((elem) => {
            elem.innerHTML = '';
          });
          field.replaceWith(clonedNode);
        }
        Array.from(GetAll('.bg-sign')).map((elem) => {
          elem.remove();
        });
        window.zoomed = false;
        Style(Get('.board'), {
          transform: 'scale(1)',
        });
        Style(Get('.mainSpacers'), {
          opacity: '1',
        });
      }, 300);
    }, 500);
  });
  Append(exitBtn, wrapper);
  Append(wrapper, Get('#game-tab'));
  setTimeout(() => {
    Style(wrapper, {
      opacity: '1',
    });
  }, 10);
  try {
    wsocket.close();
    joiningInProcess = false;
    wsocket = null;
  } catch (e) {}
}

function checkWin() {
  const matches = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9],
    [1, 5, 9],
    [3, 5, 7],
  ];
  const mainpos = JSON.parse(sessionStorage.getItem('main_position'));
  let isWin = false;
  matches.map((match) => {
    if (
      mainpos[match[0]] === mainpos[match[1]] &&
      mainpos[match[1]] === mainpos[match[2]] &&
      mainpos[match[0]] !== ''
    ) {
      isWin = true;
    }
  });
  return isWin;
}

function checkFieldSign() {
  const positions = JSON.parse(
    JSON.stringify(JSON.parse(sessionStorage.getItem('position')))
  );
  const matches = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9],
    [1, 5, 9],
    [3, 5, 7],
  ];
  let checked = false;
  positions.map((pos, index) => {
    matches.map((match) => {
      if (
        pos[match[0]] === pos[match[1]] &&
        pos[match[1]] === pos[match[2]] &&
        pos[match[0]] !== ''
      ) {
        checked = true;
        function fillField() {
          const img = Create('img');
          Style(img, {
            width: '90%',
            height: '90%',
            opacity: '.1',
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          });
          img.classList.add('bg-sign');
          img.setAttribute(
            'src',
            `./assets/${pos[match[0]].toLowerCase()}.svg`
          );
          let mainfields = JSON.parse(sessionStorage.getItem('main_position'));
          let numInx = `${index + 1}`;
          mainfields[numInx] = `${pos[match[0]]}`;
          sessionStorage.setItem('main_position', JSON.stringify(mainfields));
          Append(img, GetAll('.field')[index]);
          Array.from(
            GetAll('.field')
              [index].querySelector('.grid')
              .querySelectorAll('.pos')
          ).map((el, index) => {
            if (el.innerHTML != null) {
              if (el.querySelector('img') != null) {
                el.querySelector('img').remove();
              }
            }
          });
          positions.map((p, index_pos) => {
            if (index == index_pos) {
              for (let key in positions[index_pos]) {
                if (positions[index_pos].hasOwnProperty(key)) {
                  positions[index_pos][key] = '';
                }
              }
            }
          });
          sessionStorage.setItem('position', JSON.stringify(positions));
        }

        if (GetAll('.field')[index].querySelector('.bg-sign') !== null) {
          GetAll('.field')[index].querySelector('.bg-sign').remove();
          fillField();
        }

        if (GetAll('.field')[index].querySelector('.bg-sign') === null) {
          fillField();
        }
      }
    });
  });
  if (!checked) {
    positions.map((pos, inx) => {
      if (hasNonEmptyValues(pos)) {
        for (let key in pos) {
          if (pos.hasOwnProperty(key)) {
            pos[key] = '';
          }
        }
        Array.from(
          GetAll('.field')[inx].querySelector('.grid').querySelectorAll('.pos')
        ).map((el) => {
          if (el.innerHTML != null) {
            if (el.querySelector('img') != null) {
              el.querySelector('img').remove();
            }
          }
        });
      }
    });
    sessionStorage.setItem('position', JSON.stringify(positions));
  }
}

function updateLastesPosition() {
  window.transformIndex = window.transformIndex + 1;
  Get('.wrapper-oldest-played').innerHTML += `<p>${window.latestPos}</p>`;
  Get('.wrapper-latest-played').innerHTML += `<p>${window.latestPos}</p>`;
  Style(Get('.wrapper-latest-played'), {
    transform: `translateY(-${1.7 * window.transformIndex}rem)`,
  });
  setTimeout(() => {
    Style(Get('.wrapper-oldest-played'), {
      transform: `translateY(-${1.7 * transformIndex}rem)`,
    });
  }, 150);
}

function getCurrentTime() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;

  return hours + ':' + minutesStr + ' ' + ampm;
}

function loadGame() {
  Style(Get('#game-tab'), {
    display: 'block',
  });
  setTimeout(() => {
    Style(Get('#game-tab'), {
      opacity: '1',
    });
    setTimeout(() => {
      Style(Get('.head'), {
        opacity: '1',
        transform: 'translateY(0) translateX(-50%)',
      });
      setTimeout(() => {
        Style(Get('.movesStates'), {
          opacity: '1',
          transform: 'translateY(0) translateX(-50%)',
        });
        setTimeout(() => {
          Style(Get('.board-overflow-controller'), {
            opacity: '1',
            transform: 'translateY(0) translateX(-50%)',
          });
          setTimeout(() => {
            Style(Get('.zoomToggle'), {
              opacity: '.4',
              transform: 'translateY(0) translateX(-50%)',
            });
            setTimeout(() => {
              Style(Get('.turns'), {
                transform: 'translateY(0%)',
              });
            }, 100);
          }, 100);
        }, 100);
      }, 100);
    }, 300);
  }, 10);
}

function inGameAlert(msg, timeOut = 1500) {
  const container = Create('div');
  container.classList.add('inGameAlert');
  container.innerHTML = `<p>${msg}</p>`;
  Append(container, Get());
  setTimeout(() => {
    Style(container, {
      opacity: '1',
    });
    setTimeout(() => {
      Style(container, {
        opacity: '0',
      });
      setTimeout(() => {
        container.remove();
      }, 300);
    }, timeOut);
  }, 100);
}

let wsocket;
let roomId = null;
let tqms = 0;
let joiningInProcess = false;
function startQuickmatchQueue() {
  Style(Get('.quickmatchQueueTab'), {
    display: 'flex',
  });
  setTimeout(() => {
    Style(Get('.quickmatchQueueTab'), {
      opacity: '1',
    });
    setTimeout(() => {
      quickmatchUpdateStatus('Waiting in queue...');
      setTimeout(async () => {
        quickmatchUpdateStatus('Searching for room...');
        setTimeout(async () => {
          wsocket = await new WebSocket(`ws://${window.location.host}`);
          wsocket.onopen = () => {
            wsocket.send(
              JSON.stringify({
                type: 'join',
                username: window.user.displayName,
              })
            );
          };

          // wsocket.onclose = () => {
          //   // alert('Connection closed. Please refresh the page to reconnect.');
          //   // window.location.reload();
          // };

          wsocket.onerror = (error) => {
            inGameAlert('WebSocket Error');
          };

          wsocket.onmessage = (evnt) => {
            const data = JSON.parse(evnt.data);
            if (data.type === 'waiting') {
              quickmatchUpdateStatus('Creating room...');
              setTimeout(() => {
                if (joiningInProcess) return;
                quickmatchUpdateStatus(data.message);
                Style(Get('.exitQueue'), {
                  backgroundColor: '#BDFE00',
                  boxShadow: '0 0 10px #befe0079',
                });

                event.click(Get('.exitQueue'), () => {
                  wsocket.send(JSON.stringify({ type: 'exit', roomId }));
                  wsocket.close();
                  quickmatchUpdateStatus('Canceling quickmatch...');
                  Get('.exitQueue').replaceWith(
                    Get('.exitQueue').cloneNode(true)
                  );
                  Style(Get('.exitQueue'), {
                    backgroundColor: '#2f2f2f',
                    boxShadow: '0 0 0 transparent',
                  });
                  setTimeout(() => {
                    Style(Get('.quickmatchQueueTab'), {
                      opacity: '0',
                    });
                    setTimeout(() => {
                      Style(Get('.quickmatchQueueTab'), {
                        display: 'none',
                      });
                      Get('.status-wrapper').querySelector(
                        '.innerWrapper'
                      ).innerHTML = `<p style="opacity: 0;">0</p>`;
                      Style(
                        Get('.status-wrapper').querySelector('.innerWrapper'),
                        {
                          transform: 'translateY(0)',
                        }
                      );
                      tqms = 0;
                    }, 400);
                  }, 1000);
                });
              }, 1500);
            } else if (data.type === 'room') {
              roomId = data.roomId;
              joiningInProcess = true;

              const joinOrderMessage = data.joinOrder;
              const opponentDN = data.opponent;
              setTimeout(() => {
                Get('.exitQueue').replaceWith(
                  Get('.exitQueue').cloneNode(true)
                );
                setTimeout(() => {
                  Style(Get('.exitQueue'), {
                    backgroundColor: '#2f2f2f',
                    boxShadow: '0 0 0 transparent',
                  });
                  quickmatchUpdateStatus('Joining game...');
                  fetch(`/updatemn?token=${localStorage.getItem('token')}`)
                    .then((res) => res.json())
                    .then((data) => {
                      window.user = data.user;
                    });
                  setTimeout(() => {
                    Style(Get('.quickmatchQueueTab'), {
                      opacity: '0',
                    });
                    setTimeout(() => {
                      Style(Get('.quickmatchQueueTab'), {
                        display: 'none',
                      });
                      responsesWait.show();
                      setTimeout(() => {
                        startQuickMatch(joinOrderMessage, opponentDN);
                      }, 1500);
                    }, 500);
                  }, 1000);
                }, 10);
              }, 500);
            } else if (data.type === 'disconnected') {
              joiningInProcess = false;
              endGame(data.message);
            } else if (data.type === 'roomDeleted') {
              alert('The room has been deleted.');
              joiningInProcess = false;
            }
          };
        }, 1500);
      }, 1500);
    }, 500);
  }, 10);
}

function quickmatchUpdateStatus(message) {
  tqms++;
  const p = Create('p');
  p.innerText = message;
  Append(p, Get('.status-wrapper').querySelector('.innerWrapper'));
  Style(Get('.status-wrapper').querySelector('.innerWrapper'), {
    transform: `translateY(-${tqms * 1.5}rem)`,
  });
}

function startQuickMatch(startPlayer, opponentDN) {
  responsesWait.hide();
  window.opponent = opponentDN;
  window.playerSign = startPlayer;
  startGameWS(startPlayer);
}

async function startGameWS(startPlayer) {
  setTimeout(async () => {
    Get('.clock').innerText = `${getCurrentTime()}`;
    Get('.player').querySelector('p').innerText = window.user.displayName;
    Get('.opponent').querySelector('p').innerText = window.opponent;
    await loadGame();
    window.latestPos = '';
    window.transformIndex = 0;
    await sessionStorage.setItem(
      'position',
      JSON.stringify([
        { 1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: '', 9: '' },
        { 1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: '', 9: '' },
        { 1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: '', 9: '' },
        { 1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: '', 9: '' },
        { 1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: '', 9: '' },
        { 1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: '', 9: '' },
        { 1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: '', 9: '' },
        { 1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: '', 9: '' },
        { 1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: '', 9: '' },
      ])
    );
    await sessionStorage.setItem(
      'main_position',
      JSON.stringify({
        1: '',
        2: '',
        3: '',
        4: '',
        5: '',
        6: '',
        7: '',
        8: '',
        9: '',
      })
    );
    setTimeout(() => {
      inGameAlert('Choose field to start.', 1500);
      setTimeout(() => {
        inGameAlert(
          `${startPlayer ? 'You are' : `${window.opponent} is`} on the spot.`,
          1500
        );
        setTimeout(() => {
          vibrateOnTouch(250);
        }, 1700);
        setTimeout(() => {
          if (startPlayer) {
            Get('.player').classList.add('active-turn');
          } else {
            Get('.opponent').classList.add('active-turn');
          }
          setTimeout(() => {
            for (let field of GetAll('.field')) {
              function handleClick() {
                mapElsStart(field);
                window.latestPos = `${
                  fieldMap.x[Number(field.getAttribute('pos')) - 1]
                }${fieldMap.y[Number(field.getAttribute('pos')) - 1]}`;
                updateLastesPosition();
                field.removeEventListener('click', handleClick);
                wsocket.send(
                  JSON.stringify({
                    type: 'startField',
                    el: field.outerHTML,
                  })
                );
              }

              if (startPlayer) {
                field.addEventListener('click', handleClick);
              }
            }

            if (!startPlayer) {
              wsocket.addEventListener('message', (evnt) => {
                const data = JSON.parse(evnt.data);
                if (data.type === 'startField') {
                  const div = Create('div');
                  div.innerHTML = data.el;
                  const field = div.querySelector('.field');
                  mapElsStart(field);
                  window.latestPos = `${
                    fieldMap.x[Number(field.getAttribute('pos')) - 1]
                  }${fieldMap.y[Number(field.getAttribute('pos')) - 1]}`;
                  updateLastesPosition();
                }
              });
            }

            function mapElsStart(el) {
              window.zoomed = false;
              const board = Get('.board');
              const pos = el.getAttribute('pos');
              updateOrigin(origins[pos].x, origins[pos].y);
              board.setAttribute('allowZoom', true);
              zoomBoard();
              GetAll('.field')[Number(pos) - 1].classList.add('activeField');
              if (startPlayer) {
                disableFieldClick();
              }
              window.playerMove = startPlayer;
              // window.playerSign = startPlayer ? 'X' : 'O';
              window.playerSign = {
                user: startPlayer ? 'X' : 'O',
                opponent: startPlayer ? 'O' : 'X',
              };
              runFieldPlayWS();
            }

            function disableFieldClick() {
              for (let field of GetAll('.field')) {
                field.replaceWith(field.cloneNode(true));
              }
            }
          }, 300);
        }, 1500);
      }, 2000);
    }, 1500);
    setInterval(() => {
      Get('.clock').innerText = `${getCurrentTime()}`;
    }, 5000);
  }, 100);
}

function runFieldPlayWS() {
  if (window.playerMove) {
    Array.from(Get('.activeField').querySelectorAll('.pos')).map(
      (element, index) => {
        event.click(element, () => {
          let positions = JSON.parse(sessionStorage.getItem('position'));
          if (
            positions[`${Number(Get('.activeField').getAttribute('pos')) - 1}`][
              `${index + 1}`
            ] == ''
          ) {
            wsocket.send(
              JSON.stringify({
                type: 'field',
                field: element.outerHTML,
              })
            );
            vibrateOnTouch(50);
            positions[`${Number(Get('.activeField').getAttribute('pos')) - 1}`][
              `${index + 1}`
            ] = window.playerSign.user;
            window.latestPos = `${fieldMap.x[Number(index)]}${
              fieldMap.y[index]
            }`;
            updateLastesPosition();
            element.innerHTML = `<img src="./assets/${window.playerSign.user.toLowerCase()}.svg" />`;
            setTimeout(() => {
              if (element.querySelector('img') !== null) {
                Style(element.querySelector('img'), {
                  transform: 'scale(1)',
                  opacity: '1',
                });
              }
            }, 100);
            sessionStorage.setItem('position', JSON.stringify(positions));
            checkFieldSign();
            window.playerMove = false;
            setTimeout(() => {
              Array.from(Get('.activeField').querySelectorAll('.pos')).map(
                (el) => {
                  const clonedElement = el.cloneNode(true);
                  el.parentNode.replaceChild(clonedElement, el);
                }
              );
            }, 300);
            if (window.zoomed) {
              zoomBoard({ unzoom: true, zoom: false });
              if (Get('.activeZoom') !== null) {
                Get('.activeZoom').classList.remove('activeZoom');
              }
            }
            setTimeout(() => {
              Get('.activeField').classList.remove('activeField');
              setTimeout(() => {
                updateOrigin(origins[index + 1].x, origins[index + 1].y);
                if (!checkWin()) {
                  zoomBoard({ unzoom: false, zoom: true });
                  GetAll('.field')[index].classList.add('activeField');
                  Get('.active-turn').classList.remove('active-turn');
                  setTimeout(() => {
                    Get('.opponent').classList.add('active-turn');
                  }, 250);
                  runFieldPlayWS();
                } else {
                  zoomBoard({ unzoom: true, zoom: false });
                  endGame('You won the match');
                  playSound('win');
                  fetch(`/updatewn?token=${localStorage.getItem('token')}`)
                    .then((res) => res.json())
                    .then((data) => {
                      window.user = data.user;
                    });
                }
              }, 200);
            }, 450);
          } else {
            vibrateOnTouch(25);
            setTimeout(() => {
              vibrateOnTouch(25);
            }, 75);
          }
        });
      }
    );
  } else {
    wsocket.addEventListener('message', socketListener);

    async function socketListener(evnt) {
      wsocket.removeEventListener('message', socketListener);
      const data = JSON.parse(evnt.data);
      if (data.type === 'field') {
        const div = Create('div');
        div.innerHTML = data.field;
        const field = div.querySelector('.pos');

        let positions = await JSON.parse(sessionStorage.getItem('position'));
        let genP = Number(field.getAttribute('index'));
        if (
          positions[`${Number(Get('.activeField').getAttribute('pos')) - 1}`][
            `${genP}`
          ] == ''
        ) {
          await vibrateOnTouch(50);
          positions[`${Number(Get('.activeField').getAttribute('pos')) - 1}`][
            `${genP}`
          ] = window.playerSign.opponent;
          window.latestPos = `${fieldMap.x[Number(genP - 1)]}${
            fieldMap.y[genP - 1]
          }`;
          await updateLastesPosition();
          Get('.activeField').querySelectorAll('.pos')[
            genP - 1
          ].innerHTML = `<img src="./assets/${window.playerSign.opponent.toLowerCase()}.svg" />`;
          await setTimeout(() => {
            if (
              Get('.activeField')
                .querySelectorAll('.pos')
                [genP - 1].querySelector('img') !== null
            ) {
              Style(
                Get('.activeField')
                  .querySelectorAll('.pos')
                  [genP - 1].querySelector('img'),
                {
                  transform: 'scale(1)',
                  opacity: '1',
                }
              );
            }
          }, 100);
          sessionStorage.setItem('position', JSON.stringify(positions));
          checkFieldSign();
          window.playerMove = true;
          zoomBoard({ unzoom: true, zoom: false });
          setTimeout(() => {
            Get('.activeField').classList.remove('activeField');
            setTimeout(() => {
              updateOrigin(origins[genP].x, origins[genP].y);
              if (!checkWin()) {
                zoomBoard({ unzoom: false, zoom: true });
                GetAll('.field')[genP - 1].classList.add('activeField');
                Get('.active-turn').classList.remove('active-turn');
                setTimeout(() => {
                  Get('.player').classList.add('active-turn');
                }, 250);
                runFieldPlayWS();
              } else {
                zoomBoard({ unzoom: true, zoom: false });
                endGame(`${window.opponent} won the match`);
                playSound('lose');
              }
            }, 200);
          }, 450);
        }
      }
    }
  }
}
