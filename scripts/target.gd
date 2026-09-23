extends Area2D

signal destroyed(target: Area2D)

@onready var burst: Polygon2D = $Burst

var is_destroyed := false


func _ready() -> void:
	body_entered.connect(_on_body_entered)


func destroy_target() -> void:
	if is_destroyed:
		return
	is_destroyed = true
	monitoring = false
	emit_signal("destroyed", self)
	var tween := create_tween()
	tween.set_parallel(true)
	tween.tween_property(self, "scale", Vector2(1.55, 1.55), 0.08)
	tween.tween_property(self, "modulate", Color(1, 1, 1, 0), 0.18)
	tween.tween_property(burst, "scale", Vector2(2.0, 2.0), 0.18)
	tween.tween_property(burst, "modulate", Color(1, 1, 1, 0), 0.18)
	tween.chain().tween_callback(queue_free)


func _on_body_entered(_body: Node) -> void:
	destroy_target()