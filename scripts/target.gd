extends Area2D

signal destroyed(target: Area2D)

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
	tween.tween_property(self, "scale", Vector2(1.55, 1.55), 0.08)
	tween.tween_property(self, "modulate", Color(1, 1, 1, 0), 0.14)
	tween.finished.connect(queue_free)


func _on_body_entered(_body: Node) -> void:
	destroy_target()