extends CanvasLayer

signal level_selected(level_id: int)

@onready var target_fill: ColorRect = $Root/TargetBack/TargetFill
@onready var shot_fill: ColorRect = $Root/ShotBack/ShotFill
@onready var result_overlay: ColorRect = $Root/ResultOverlay
@onready var transition_overlay: ColorRect = $Root/TransitionOverlay
@onready var level_toggle: Button = $Root/LevelSelectToggle
@onready var level_panel: HBoxContainer = $Root/LevelSelectPanel

const TARGET_WIDTH := 240.0
const SHOT_WIDTH := 240.0


func _ready() -> void:
	if not OS.is_debug_build():
		level_toggle.visible = false
		level_panel.visible = false
		return
	level_toggle.pressed.connect(_on_level_toggle_pressed)
	$Root/LevelSelectPanel/Level1Button.pressed.connect(_select_level.bind(0))
	$Root/LevelSelectPanel/Level2Button.pressed.connect(_select_level.bind(1))
	$Root/LevelSelectPanel/Level3Button.pressed.connect(_select_level.bind(2))
	$Root/LevelSelectPanel/Level4Button.pressed.connect(_select_level.bind(3))
	$Root/LevelSelectPanel/EndlessButton.pressed.connect(_select_level.bind(4))


func _on_level_toggle_pressed() -> void:
	level_panel.visible = not level_panel.visible


func _select_level(level_id: int) -> void:
	level_panel.visible = false
	emit_signal("level_selected", level_id)


func set_targets(current: int, maximum: int) -> void:
	var ratio := clampf(float(current) / float(maximum), 0.0, 1.0)
	target_fill.size = Vector2(TARGET_WIDTH * ratio, target_fill.size.y)


func set_shots(current: int, maximum: int) -> void:
	var ratio := clampf(float(current) / float(maximum), 0.0, 1.0)
	shot_fill.size = Vector2(SHOT_WIDTH * ratio, shot_fill.size.y)
	shot_fill.color = Color(1.0, 0.28, 0.22, 1.0).lerp(Color(0.45, 0.9, 1.0, 1.0), ratio)


func play_transition() -> void:
	_flash_overlay(Color(0.2, 0.9, 1.0, 0.32))


func play_charge() -> void:
	_flash_overlay(Color(0.3, 1.0, 0.5, 0.38))


func play_combo() -> void:
	_flash_overlay(Color(1.0, 0.75, 0.2, 0.42))


func _flash_overlay(color: Color) -> void:
	transition_overlay.visible = true
	transition_overlay.color = color
	transition_overlay.modulate = Color.WHITE
	var tween := create_tween()
	tween.tween_property(transition_overlay, "modulate:a", 0.0, 0.35)
	tween.finished.connect(func() -> void: transition_overlay.visible = false)


func show_result(won: bool) -> void:
	result_overlay.visible = true
	result_overlay.color = Color(0.2, 0.9, 1.0, 0.24) if won else Color(1.0, 0.2, 0.2, 0.26)