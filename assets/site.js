/* ==========================================================================
   Capture — Shared Interactions & Interactive Product Demo
   captureqs.space | Quiet Studio
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initEarlyAccessModal();
  initFaqAccordion();
  initInteractiveDemo();
});

/* 1. Mobile Navigation */
function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-menu-btn');
  const mobileNav = document.querySelector('.mobile-nav');
  if (!toggleBtn || !mobileNav) return;

  toggleBtn.addEventListener('click', () => {
    mobileNav.classList.toggle('open');
    const isExpanded = mobileNav.classList.contains('open');
    toggleBtn.setAttribute('aria-expanded', isExpanded);
  });
}

/* 2. Early Access Application Modal */
function initEarlyAccessModal() {
  const modal = document.getElementById('earlyAccessModal');
  if (!modal) return;

  const openBtns = document.querySelectorAll('[data-open-modal="early-access"]');
  const closeBtns = modal.querySelectorAll('[data-close-modal]');
  const form = document.getElementById('earlyAccessForm');
  const formStatus = modal.querySelector('.form-status');

  openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
      const firstInput = modal.querySelector('input');
      if (firstInput) setTimeout(() => firstInput.focus(), 100);
    });
  });

  const closeModal = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  };

  closeBtns.forEach(btn => btn.addEventListener('click', closeModal));

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = form.querySelector('#ea_email').value;
      const role = form.querySelector('#ea_role').value;
      const useCase = form.querySelector('#ea_usecase').value;
      const consent = form.querySelector('#ea_consent').checked;
      const submitBtn = form.querySelector('button[type="submit"]');

      if (!email || !consent) return;

      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';

      try {
        // Loops newsletter API endpoint
        const formData = new URLSearchParams();
        formData.append('email', email);
        formData.append('role', role);
        formData.append('useCase', useCase);

        await fetch('https://app.loops.so/api/newsletter-form/cmatylqt31ghsxb0izxxyerf0', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData
        }).catch(() => {
          // Fallback gracefully even if CORS or network blip
        });

        // Store application state locally
        localStorage.setItem('capture_beta_applied', JSON.stringify({
          email,
          role,
          useCase,
          date: new Date().toISOString()
        }));

        if (formStatus) {
          formStatus.className = 'form-status success';
          formStatus.textContent = 'Application received. We will notify you when your private beta cohort opens.';
        }

        form.reset();
        submitBtn.textContent = 'Application Submitted';
        setTimeout(() => {
          closeModal();
          submitBtn.disabled = false;
          submitBtn.textContent = 'Request early access';
        }, 2500);

      } catch (err) {
        if (formStatus) {
          formStatus.className = 'form-status error';
          formStatus.textContent = 'Submission error. Please try again or email beta@captureqs.space';
        }
        submitBtn.disabled = false;
        submitBtn.textContent = 'Request early access';
      }
    });
  }
}

/* 3. FAQ Accordion */
function initFaqAccordion() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    if (!trigger) return;
    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      items.forEach(i => i.classList.remove('open'));
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });
}

/* 4. Interactive Product Demonstration (Capture -> Space -> Agent) */
function initInteractiveDemo() {
  const demoRoot = document.getElementById('capture-interactive-demo');
  if (!demoRoot) return;

  let currentStep = 1;
  let autoTimer = null;
  const isAutoPlaying = true;

  const stepTabs = demoRoot.querySelectorAll('.demo-step-tab');
  const demoItem = demoRoot.querySelector('#demo-moving-item');
  const demoDropTarget = demoRoot.querySelector('#demo-drop-target');
  const agentThinking = demoRoot.querySelector('#demo-agent-thinking');
  const agentOutput = demoRoot.querySelector('#demo-agent-output');
  const agentLog = demoRoot.querySelector('#demo-agent-log');

  function setStep(step) {
    currentStep = step;
    
    // Update step buttons
    stepTabs.forEach(tab => {
      if (parseInt(tab.dataset.step, 10) === step) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    if (step === 1) {
      // Step 1: In Inbox
      if (demoItem) {
        demoItem.style.transform = 'translate(0, 0)';
        demoItem.style.opacity = '1';
        demoItem.classList.remove('in-space');
      }
      if (demoDropTarget) demoDropTarget.classList.remove('active-target', 'dropped');
      if (agentThinking) agentThinking.style.display = 'none';
      if (agentOutput) agentOutput.style.display = 'none';
      if (agentLog) agentLog.innerHTML = `<span class="log-entry">Waiting for new input...</span>`;
    } else if (step === 2) {
      // Step 2: Moved into Space
      if (demoItem && demoDropTarget) {
        const itemRect = demoItem.getBoundingClientRect();
        const targetRect = demoDropTarget.getBoundingClientRect();
        const deltaX = targetRect.left - itemRect.left;
        const deltaY = targetRect.top - itemRect.top;

        demoItem.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        demoItem.classList.add('in-space');
      }
      if (demoDropTarget) {
        demoDropTarget.classList.add('active-target');
        setTimeout(() => demoDropTarget.classList.add('dropped'), 400);
      }
      if (agentThinking) agentThinking.style.display = 'flex';
      if (agentOutput) agentOutput.style.display = 'none';
      if (agentLog) {
        agentLog.innerHTML = `
          <div class="log-item"><span class="badge badge--accent">Arranging</span> Placed into <strong>System Architecture</strong></div>
          <div class="log-item"><span class="badge">Analyzing</span> Correlating with <em>MCP Protocol v1.2</em></div>
        `;
      }
    } else if (step === 3) {
      // Step 3: Agent synthesized and generated answer with citation
      if (demoItem) {
        demoItem.style.opacity = '0.9';
        demoItem.classList.add('in-space');
      }
      if (demoDropTarget) demoDropTarget.classList.add('dropped');
      if (agentThinking) agentThinking.style.display = 'none';
      if (agentOutput) {
        agentOutput.style.display = 'block';
        agentOutput.classList.add('fade-in');
      }
      if (agentLog) {
        agentLog.innerHTML = `
          <div class="log-item"><span class="badge badge--accent">Completed</span> Synthesized Architecture Plan</div>
          <div class="log-item"><span class="badge">Citations</span> Linked to 2 Space documents</div>
        `;
      }
    }
  }

  // Allow clicking tabs
  stepTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      clearInterval(autoTimer);
      setStep(parseInt(tab.dataset.step, 10));
    });
  });

  // Native HTML5 Drag and Drop support
  if (demoItem && demoDropTarget) {
    demoItem.setAttribute('draggable', 'true');
    demoItem.style.cursor = 'grab';

    demoItem.addEventListener('dragstart', (e) => {
      clearInterval(autoTimer);
      demoItem.style.cursor = 'grabbing';
      e.dataTransfer.setData('text/plain', 'demo-moving-item');
      if (demoDropTarget) demoDropTarget.classList.add('active-target');
    });

    demoItem.addEventListener('dragend', () => {
      demoItem.style.cursor = 'grab';
      if (currentStep === 1 && demoDropTarget) {
        demoDropTarget.classList.remove('active-target');
      }
    });

    demoDropTarget.addEventListener('dragover', (e) => {
      e.preventDefault();
      demoDropTarget.classList.add('active-target');
    });

    demoDropTarget.addEventListener('dragleave', () => {
      if (currentStep === 1) demoDropTarget.classList.remove('active-target');
    });

    demoDropTarget.addEventListener('drop', (e) => {
      e.preventDefault();
      clearInterval(autoTimer);
      setStep(2);
      setTimeout(() => setStep(3), 1600);
    });
  }

  // Undo button interactive handler
  const undoBtn = demoRoot.querySelector('.agent-actions .btn-secondary');
  if (undoBtn) {
    undoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      clearInterval(autoTimer);
      setStep(1);
      if (agentLog) {
        agentLog.innerHTML = `
          <div class="log-item"><span class="badge">Reverted</span> Returned <strong>API Architecture Note.pdf</strong> to Inbox</div>
        `;
      }
    });
  }

  // Review button handler
  const reviewBtn = demoRoot.querySelector('.agent-actions .btn-primary');
  if (reviewBtn) {
    reviewBtn.addEventListener('click', (e) => {
      e.preventDefault();
      clearInterval(autoTimer);
      setStep(3);
      if (agentOutput) {
        agentOutput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

  // Auto-play loop
  function startAutoPlay() {
    autoTimer = setInterval(() => {
      let nextStep = currentStep + 1;
      if (nextStep > 3) nextStep = 1;
      setStep(nextStep);
    }, 4500);
  }

  // Hover pauses autoplay
  demoRoot.addEventListener('mouseenter', () => clearInterval(autoTimer));
  demoRoot.addEventListener('mouseleave', () => startAutoPlay());

  setStep(1);
  startAutoPlay();
}

