$.widget( "mathquill.mathquillToolbars", {
	mq_span: undefined,
	mq_input: undefined,
	record_timer: undefined,
	saved_equations: [],
	// Todo: Add undo and redo support

	default_buttons: {
		plus: { label: '+', latex: '+', description: 'Addition', cmd: 'cmd' },
		minus: { label: '-', latex: '-', description: 'Subtraction', cmd: 'cmd' },
		times: { label: '\\times', latex: '\\times', description: 'Multiplication', cmd: 'cmd' },
		divide: { label: '\\divide', latex: '\\divide', description: 'Division', cmd: 'cmd' },
		equal: { label: '=', latex: '=', description: 'Equal', cmd: 'cmd' },
		approx: { label: '\\approx', latex: '\\approx', description: 'Approx', cmd: 'cmd' },
		pm: { label: '\\pm', latex: '\\pm', description: 'Plus-Minus', cmd: 'cmd' },
		lt: { label: '<', latex: '<', description: 'Less Than', cmd: 'cmd' },
		gt: { label: '>', latex: '>', description: 'Greater Than', cmd: 'cmd' },
		lte: { label: '\\le', latex: '\le', description: 'Less Than or Equal To', cmd: 'cmd' },
		gte: { label: '\\ge', latex: '\\ge', description: 'Greater Than or Equal To', cmd: 'cmd' },
		frac: { label: '\\frac {x}{y}', latex: '\\frac', description: 'Fraction', cmd: 'cmd' },
		parens: { label: '(x)', latex: '(', description: 'Parentheses', cmd: 'cmd' },
		brackets: { label: '[x]', latex: '[', description: 'Brackets', cmd: 'cmd' },
		exponent: { label: 'x^{2}', latex: '^{2}', description: 'Exponent', cmd: 'write' },
		subscript: { label: 'x_{2}', latex: '_{2}', description: 'Subscript', cmd: 'write' },
		superscript: { label: 'x^{super}', latex: '^{super}', description: 'Exponent', cmd: 'write' },
		overline: { label: '\\overline{over}', latex: '\\overline{over}', description: 'Overline', cmd: 'write' },
		absolute: { label: '|x|', latex: '|', description: 'Absolute Value', cmd: 'cmd' },
		pi: { label: '\\pi', latex: '\\pi', description: 'Pi', cmd: 'write' },
		sqrt: { label: '\\sqrt x', latex: '\\sqrt', description: 'Square Root', cmd: 'cmd' },
		sqrt2: { label: '\\sqrt[x]{y}', latex: '\\sqrt[x]{y}', description: 'Square Root Alt', cmd: 'write' },
		imaginary: { label: 'i', latex: 'i', description: 'Imaginary Number', cmd: 'write' },
		degrees: { label: '\\deg', latex: '\\deg', description: 'Degrees', cmd: 'write' },
		cent: { label: '¢', latex: '¢', description: 'Cent', cmd: 'write' },
		dollar: { label: '$', latex: '$', description: 'Dollar', cmd: 'write' },
		infinity: { label: '\\infty', latex: '\\infty', description: 'Infinity', cmd: 'write' },
		angle: { label: '\\angle', latex: '\\angle', description: 'Angle', cmd: 'write' },
		theta: { label: '\\theta', latex: '\\theta', description: 'Theta', cmd: 'write' },
		triangle: { label: '\\bigtriangleup', latex: '\\bigtriangleup', description: 'Triangle', cmd: 'write' },
		phi: { label: '\\phi', latex: '\\phi', description: 'Phi', cmd: 'write' },
		sin: { label: '\\sin', latex: '\\sin', description: 'Sin', cmd: 'write' },
		cos: { label: '\\cos', latex: '\\cos', description: 'Cos', cmd: 'write' },
		tan: { label: '\\tan', latex: '\\tan', description: 'Tan', cmd: 'write' },
		arcsin: { label: '\\arcsin', latex: '\\arcsin', description: 'Arc Sin', cmd: 'write' },
		arccos: { label: '\\arccos', latex: '\\arccos', description: 'Arc Cos', cmd: 'write' },
		arctan: { label: '\\arctan', latex: '\\arctan', description: 'Arc Tan', cmd: 'write' },
		x: { label: 'x', latex: 'x', description: 'x', cmd: 'write' },
		y: { label: 'y', latex: 'y', description: 'y', cmd: 'write' }
	},

	options: {
		style: 'buttons',
		record_timer_delay: 1000,
		num_undos: 5,
		buttons: {},
		default_toolbars: ['operators', 'structure', 'symbols', 'trig', 'variables'],
		operators: ['plus', 'minus', 'times', 'divide', 'equal', 'pm', 'lt', 'gt', 'lte', 'gte'],
		structure: ['frac', 'parens', 'brackets', 'exponent', 'subscript', 'absolute'],
		symbols: ['pi', 'sqrt', 'sqrt2', 'imaginary', 'degrees', 'theta', 'phi'],
		trig: ['sin', 'cos', 'tan', 'arcsin', 'arccos', 'arctan'],
		variables: ['x', 'y']
	},

	_create: function() {
		// Init from hidden
		mq_display = $('.mathquill-toolbars-display', this.element);
		if (mq_display.length == 0) {
			console.error("Mathquill Toolbars: '.mathquill-toolbars-display' not found.");
		}
		this.mq_span = $('.mathquill-editable', mq_display);

		// Init Mq
		if (this.mq_span.length != 0 && $('.textarea', this.mq_span).length == 0) {
			this.mq_span.mathquill('editable');
		}

		// Style
		if (this.element.hasClass('mathquill-toolbars-inline')) {
			this.options.style = 'dropdown';
		}

		// Fetch 'hidden' input
		this.mq_input = $('.mathquill-toolbars-input input', this.element);
		if (this.mq_input.length == 0) {
			console.error("Mathquill Toolbars: '.mathquill-toolbars-input input' not found.");
		}
		var latex = this.mq_input.val();
		if (latex && latex.length !== 0) {
			this.mq_span.mathquill('write', latex);
			this.saved_equations.push(latex);
		}
		else {
			this.saved_equations.push('');
		}

		// Toolbars & Events
		this._buildToolbars();
		this._bindEvents();
	},

	_buildToolbars: function() {
		if (this.options.toolbars == undefined) {
			this.options.toolbars = this.options.default_toolbars;
		}
		var toolbar_groups = [];
		if (this.options.toolbars.length != 0) {
			for (var g = 0; g <= this.options.toolbars.length - 1; g++) {
				toolbar_groups[g] = [];
				var toolbar_name = this.options.toolbars[g];
				if (this.options[toolbar_name] == undefined) {
					console.error("Mathquill Toolbars: Toolbar '" + toolbar_name + "' not found.");
					continue;
				}
				var toolbar = this.options[toolbar_name];
				for (var x = 0; x <= toolbar.length - 1; x++) {
					var btn_name = toolbar[x];
					var btn_opt;
					if (this.default_buttons[btn_name] !== undefined) {
						btn_opt = this.default_buttons[btn_name];
					}
					else if (this.options.buttons[btn_name] !== undefined) {
						btn_opt = this.options.buttons[btn_name];
					}
					else {
						console.error("Mathquill Toolbars: Button '" + btn_name + "' not found.");
					}
					// Button HTML
					if (this.options.style == 'dropdown') {
						toolbar_groups[g].push('<a href="javascript://" class="mathquill-toolbars-btn" data-fragment="' + btn_opt.name + '" data-latex="' + btn_opt.latex + '" data-cmd="' + btn_opt.cmd + '" title="' + btn_opt.description + '"><span class="mathquill-embedded-latex">' + btn_opt.label + '</span></a>');
					}
					else {
						toolbar_groups[g].push('<button class="mathquill-toolbars-btn btn btn-small" data-fragment="' + btn_opt.name + '" data-latex="' + btn_opt.latex + '" data-cmd="' + btn_opt.cmd + '" title="' + btn_opt.description + '"><span class="mathquill-embedded-latex">' + btn_opt.label + '</span></button>');
					}

				};
			};
			if (this.options.style == 'dropdown') {
				var toolbar_html = '<span class="mathquill-toolbarset">';
				toolbar_html += '<div class="mathquill-toolbars btn-group">';
				toolbar_html += '<a href="javascript://" class="btn dropdown-toggle" data-toggle="dropdown"><i class="icon-superscript"></i><span class="caret"></span></a>';
				var width = toolbar_groups.length * 80;
				toolbar_html += '<ul class="dropdown-menu" style="width: ' + width + 'px;">';
				for (var g = 0; g <= toolbar_groups.length - 1; g++) {
					toolbar_html += '<li><ul class="mathquill-toolbars-list">';
					for (var b = 0; b <= toolbar_groups[g].length - 1; b++) {
						toolbar_html += '<li>' + toolbar_groups[g][b] + '</li>';
					}
					toolbar_html += '</ul></li>';
				}
				toolbar_html += '</ul></div></span>';
				$(this.element).append(toolbar_html);
			}
			else {
				var toolbar_html = '<div class="mathquill-toolbarset">';
				for (var g = 0; g <= toolbar_groups.length - 1; g++) {
					toolbar_html += '<div class="mathquill-toolbars btn-group">';
					for (var b = 0; b <= toolbar_groups[g].length - 1; b++) {
						toolbar_html += toolbar_groups[g][b];
					}
					toolbar_html += '</div>';
				}
				toolbar_html += '</div>';
				$(this.element).prepend(toolbar_html);

			}
		}

		$('.mathquill-toolbars .mathquill-embedded-latex', this.element).mathquill();
	},

	_bindEvents: function() {
		// Save
		this.element.on('save', function() {
			$(this).mathquillToolbars('save');
		});

		// Dropdown Menu Click
		$(".mathquill-toolbarset a.dropdown-toggle", this.element).on( "click", function() {
			var dropdown = $(this).parent();
			// Dirty Hack: no event on bootstrap dropdown ?
			window.setTimeout(function() {
				$('.dropdown-menu .mathquill-embedded-latex', dropdown).mathquill('redraw');
			}, 50);
		});

		// Toolbar clicks
		$(".mathquill-toolbars .mathquill-toolbars-btn", this.element).on( "click", function() {
			var btn = $(this);
			btn.parents('.mathquill-toolbars-container').mathquillToolbars('insert', btn);
			return false;
		});

		// MQ Keydown / Keypress
		this.mq_span.on( "keydown", function() {
			$(this).parents('.mathquill-toolbars-container').mathquillToolbars('setSaveTimer');
		}).on( "keypress", function() {
			$(this).parents('.mathquill-toolbars-container').mathquillToolbars('setSaveTimer');
		});
	},

	insert: function(btn) {
		var editor = $('.mathquill-editable', $(btn).parents('.mathquill-toolbars-container')).focus();
		var latex = btn.data('latex');
		if (latex) {
			editor.mathquill(btn.data('cmd'), latex).focus();
			this.setSaveTimer();
		}
	},

	setSaveTimer: function() {
		if (this.saveTimer() !== undefined) return true;

		function callSave(obj) {
			obj.element.trigger("save");
		}
		var timeout = window.setTimeout(callSave.bind(this, this), this.options.record_timer_delay);
		this.saveTimer(timeout);
	},

	saveTimer: function(timer) {
		if (timer === undefined) {
			return this.record_timer;
		}

		this.record_timer = timer;
	},

	save: function() {
		var new_latex = this.mq_span.mathquill('latex');
		var curr_len = this.saved_equations.length;
		if (curr_len === 0 || this.saved_equations[curr_len - 1] !== new_latex) {
			curr_len = this.saved_equations.push(new_latex);
			this.val(new_latex);
			if (curr_len > this.options.num_undos) {
				this.saved_equations.shift();
			}
		}
		// Clear out Save Timer
		this.record_timer = undefined;
	},

	val: function(value) {
		var curr_len = this.saved_equations.length;
		if (value === undefined) {
			if (curr_len !== 0) return this.saved_equations[curr_len - 1];
			return null;
		}

		if (this.mq_input.val() != value) {
			if (curr_len === 0) curr_len = this.saved_equations.push(value);
			this.mq_input.val(value);
			this.mq_input.trigger('change');
		}
	}

});