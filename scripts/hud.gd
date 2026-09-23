extends CanvasLayer

@onready var target_fill: ColorRect = $Root/TargetBack/TargetFill
@onready var shot_fill: ColorRect = $Root/ShotBack/ShotFill
@onready var result_overlay: ColorRect = $Root/ResultOverlay
@onready var transition_overlay: ColorRect = $Root/TransitionOverlay

const TARGET_WIDTH := 240.0
const SHOT_WIDTH := 240.0


func set_targets(current: int, maximum: int) -> void:
	var ratio := clampf(float(current) / float(maximum), 0.0, 1.0)
	target_fill.size = Vector2(TARGET_WIDTH * ratio, target_fill.size.y)


func set_shots(current: int, maximum: int) -> void:
	var ratio := clampf(float(current) / float(maximum), 0.0, 1.0)
	shot_fill.size = Vector2(SHOT_WIDTH * ratio, shot_fill.size.y)
	shot_fill.color = Color(1.0, 0.28, 0.22, 1.0).lerp(Color(0.45, 0.9, 1.0, 1.0), ratio)


func play_transition() -> void:
	transition_overlay.visible = true
	transition_overlay.modulate = Color.WHITE
	var tween := create_tween()
	tween.tween_property(transition_overlay, "modulate:a", 0.0, 0.35)
	tween.finished.connect(func() -> void: transition_overlay.visible = false)


func show_result(won: bool) -> void:
	result_overlay.visible = true
	result_overlay.color = Color(0.2, 0.9, 1.0, 0.24) if won else Color(1.0, 0.2, 0.2, 0.26)